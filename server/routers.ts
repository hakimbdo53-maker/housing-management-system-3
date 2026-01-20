import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { sdk } from "./_core/sdk";
import { TRPCError } from "@trpc/server";
import {
  applicationSubmissionSchema,
  studentRegistrationSchema,
  studentProfileUpdateSchema,
  formatValidationError,
} from "./validationSchemas";
import {
  validateFileForUpload,
  ensureUploadDirectory,
  getFileUploadPath,
  getFileStorageReference,
} from "./middleware/fileUpload";

// Helper to ensure user is authenticated
const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "يجب تسجيل الدخول أولاً",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => {
      console.log("[API] auth.me called - ctx.user:", opts.ctx.user ? { id: opts.ctx.user.id, username: opts.ctx.user.username } : null);
      return opts.ctx.user;
    }),
    signup: publicProcedure
      .input(z.object({
        username: z.string().min(3),
        studentId: z.string().min(1),
        password: z.string().min(6),
        // Profile data - unified field names
        fullName: z.string().optional(),
        nationalId: z.string().optional(),
        phoneNumber: z.string().optional(),
        email: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const existingUser = await db.getUserByUsername(input.username);
        if (existingUser) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "اسم المستخدم موجود بالفعل",
          });
        }
        
        const user = await db.createUser({
          username: input.username,
          studentId: input.studentId,
          password: input.password, // In production, hash this!
          role: "user",
          // Profile data - unified field names
          fullName: input.fullName,
          nationalId: input.nationalId,
          phoneNumber: input.phoneNumber,
          email: input.email,
        });

        return { success: true, user };
      }),
    login: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByUsername(input.username);
        if (!user || user.password !== input.password) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "اسم المستخدم أو كلمة المرور غير صحيحة",
          });
        }

        const sessionToken = await sdk.createSessionToken(user.username, {
          name: user.username,
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true, user };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Complaints Router
  complaints: router({
    // Get all complaints for the logged-in student
    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        const complaints = await db.getComplaintsByUserId(ctx.user!.id);
        return complaints;
      } catch (error) {
        console.error('Error fetching complaints:', error);
        return [];
      }
    }),

    // Submit a new complaint
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(3, 'عنوان الشكوى مطلوب'),
        description: z.string().min(10, 'وصف الشكوى مطلوب'),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const complaint = await db.createComplaint({
            userId: ctx.user!.id,
            title: input.title,
            description: input.description,
            status: 'pending',
            createdAt: new Date(),
          });

          return { success: true, complaint };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل تقديم الشكوى. يرجى المحاولة لاحقاً.",
          });
        }
      }),
  }),

  // Applications Router
  applications: router({
    create: protectedProcedure
      .input(applicationSubmissionSchema)
      .mutation(async ({ input, ctx }) => {
        // Validation is automatically performed by Zod schema
        // If validation fails, tRPC will throw a 400 error automatically
        
        const application = await db.createApplication({
          userId: ctx.user!.id,
          studentType: input.studentType,
          fullName: input.fullName,
          studentId: input.studentId,
          nationalId: input.nationalId,
          email: input.email,
          phone: input.phone,
          major: input.major,
          gpa: input.gpa,
          address: input.address,
          governorate: input.governorate,
          familyIncome: input.familyIncome,
          additionalInfo: input.additionalInfo,
        });

        return { success: true, application };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      const applications = await db.getApplicationsByUserId(ctx.user!.id);
      return applications;
    }),

    getById: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ input, ctx }) => {
        const application = await db.getApplicationById(input.id);
        if (!application || application.userId !== ctx.user!.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "الطلب غير موجود",
          });
        }
        return application;
      }),

    // Public procedure for searching by national ID
    searchByNationalId: publicProcedure
      .input(z.object({
        nationalId: z.string().min(1, 'الرقم القومي مطلوب'),
      }))
      .query(async ({ input }) => {
        const applications = await db.getApplicationsByNationalId(input.nationalId);
        if (applications.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "لم يتم العثور على طلب بهذا الرقم القومي",
          });
        }
        return applications;
      }),
  }),

  // File Upload Router
  files: router({
    uploadReceipt: protectedProcedure
      .input(
        z.object({
          filename: z.string().min(1, "اسم الملف مطلوب"),
          mimeType: z.string().min(1, "نوع الملف مطلوب"),
          fileSize: z.number().positive("حجم الملف غير صحيح"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Validate file before processing
          const validation = validateFileForUpload(
            input.mimeType,
            input.fileSize,
            input.filename
          );

          if (!validation.isValid) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "الملف غير صحيح",
            });
          }

          // Ensure upload directory exists
          ensureUploadDirectory();

          // Generate storage reference
          const storageRef = getFileStorageReference(validation.uniqueFilename);

          return {
            success: true,
            filename: validation.uniqueFilename,
            storageRef,
            uploadPath: getFileUploadPath(validation.uniqueFilename),
            message: "تم قبول الملف بنجاح",
          };
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل معالجة الملف، حاول مرة أخرى",
          });
        }
      }),

    // Validate file before upload (separate endpoint for client-side pre-validation)
    validateFile: publicProcedure
      .input(
        z.object({
          mimeType: z.string(),
          fileSize: z.number(),
          filename: z.string(),
        })
      )
      .query(async ({ input }) => {
        try {
          validateFileForUpload(input.mimeType, input.fileSize, input.filename);
          return {
            isValid: true,
            message: "الملف صحيح ويمكن رفعه",
          };
        } catch (error) {
          if (error instanceof TRPCError) {
            return {
              isValid: false,
              message: error.message,
            };
          }
          return {
            isValid: false,
            message: "فشل التحقق من الملف",
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
