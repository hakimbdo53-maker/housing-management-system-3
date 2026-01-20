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

// DTOs matching Swagger exactly
type StudentTypeEnum = 0 | 1;

type StudentDto = {
  studentId?: number;
  nationalId?: string;
  fullName?: string;
  studentType?: StudentTypeEnum;
  birthDate?: string;
  birthPlace?: string;
  gender?: string;
  religion?: string;
  governorate?: string;
  city?: string;
  address?: string;
  email?: string;
  phone?: string;
  faculty?: string;
  department?: string;
  level?: string;
  fatherContactId?: number;
  guardianContactId?: number;
  userId?: number;
};

type FamilyContactDto = {
  contactId?: number;
  fullName?: string;
  nationalId?: string;
  relation?: string;
  job?: string;
  phoneNumber?: string;
  address?: string;
};

type SecondaryEducationDto = {
  studentId?: number;
  secondaryStream?: string;
  totalScore?: number;
  percentage?: number;
  grade?: string;
};

type AcademicEducationDto = {
  studentId?: number;
  currentGPA?: number;
  lastYearGrade?: string;
};

type FullFormDto = {
  studentType: StudentTypeEnum;
  studentInfo: StudentDto;
  fatherInfo: FamilyContactDto;
  selectedGuardianRelation?: string;
  otherGuardianInfo: FamilyContactDto;
  secondaryInfo: SecondaryEducationDto;
  academicInfo: AcademicEducationDto;
};

type SubmitComplaintDto = {
  title: string;
  message: string;
};

type FeePaymentDto = {
  studentId?: number;
  transactionCode?: string;
  receiptFilePath?: string;
};

type FeesDto = {
  feeId?: number;
  amount?: number;
  feeType?: string;
  status?: string;
  createdAt?: string;
  studentId?: number;
  userId?: number;
};

type NotificationDto = {
  notificationId?: number;
  title?: string;
  message?: string;
  createdAt?: string;
  isRead?: boolean;
  studentId?: number;
  userId?: number;
  applicationId?: number;
};

type LoginDto = {
  username: string;
  password: string;
};

type RegisterDto = {
  userName: string;
  password: string;
  role: string;
  studentId?: number;
};

export const appRouter = router({
  // System router - keep as-is
  system: systemRouter,

  // ============================================
  // STUDENT AUTH ROUTES (Swagger: /api/student/auth/*)
  // ============================================
  student: router({
    auth: router({
      // POST /api/student/auth/register - RegisterDto
      register: publicProcedure
        .input(z.object({
          userName: z.string().min(1, "اسم المستخدم مطلوب"),
          password: z.string().min(1, "كلمة المرور مطلوبة"),
          role: z.string().min(1, "الدور مطلوب"),
          studentId: z.number().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          try {
            const existingUser = await db.getUserByUsername(input.userName);
            if (existingUser) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "اسم المستخدم موجود بالفعل",
              });
            }

            const user = await db.createUser({
              username: input.userName,
              studentId: input.studentId?.toString() || "",
              password: input.password,
              role: input.role,
            });

            return { success: true, user };
          } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "فشل التسجيل",
            });
          }
        }),

      // POST /api/student/auth/login - LoginDto
      login: publicProcedure
        .input(z.object({
          username: z.string().min(1, "اسم المستخدم مطلوب").max(50),
          password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
        }))
        .mutation(async ({ input, ctx }) => {
          try {
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
            ctx.res.cookie(COOKIE_NAME, sessionToken, {
              ...cookieOptions,
              maxAge: ONE_YEAR_MS,
            });

            return { success: true, user };
          } catch (error) {
            if (error instanceof TRPCError) throw error;
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "فشل تسجيل الدخول",
            });
          }
        }),
    }),

    // ============================================
    // STUDENT PROFILE ROUTES (Swagger: /api/student/profile/*)
    // ============================================
    profile: router({
      // GET /api/student/profile/notifications
      notifications: protectedProcedure.query(async ({ ctx }) => {
        try {
          const notifications = await db.getNotificationsByUserId(ctx.user!.id);
          return notifications || [];
        } catch (error) {
          console.error("Error fetching notifications:", error);
          return [];
        }
      }),

      // PUT /api/student/profile/notifications/{id}/read
      markNotificationAsRead: protectedProcedure
        .input(z.object({
          id: z.number(),
        }))
        .mutation(async ({ input, ctx }) => {
          try {
            const notification = await db.markNotificationAsRead(input.id);
            return notification;
          } catch (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "فشل تحديث الإشعار",
            });
          }
        }),

      // GET /api/student/profile/fees
      fees: protectedProcedure.query(async ({ ctx }) => {
        try {
          const fees = await db.getFeesByStudentUserId(ctx.user!.id);
          return fees || [];
        } catch (error) {
          console.error("Error fetching fees:", error);
          return [];
        }
      }),

      // GET /api/student/profile/assignments
      assignments: protectedProcedure.query(async ({ ctx }) => {
        try {
          const assignments = await db.getRoomAssignmentsByUserId(ctx.user!.id);
          return assignments || [];
        } catch (error) {
          console.error("Error fetching assignments:", error);
          return [];
        }
      }),

      // GET /api/student/profile/details
      details: protectedProcedure.query(async ({ ctx }) => {
        try {
          const student = await db.getStudentByUserId(ctx.user!.id);
          return student;
        } catch (error) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "لم يتم العثور على بيانات الطالب",
          });
        }
      }),
    }),

    // ============================================
    // STUDENT APPLICATIONS ROUTES (Swagger: /api/student/applications/*)
    // ============================================
    applications: router({
      // POST /api/student/applications/submit - FullFormDto
      submit: protectedProcedure
        .input(z.object({
          studentType: z.number().int(),
          studentInfo: z.object({
            studentId: z.number().optional(),
            nationalId: z.string().optional(),
            fullName: z.string().optional(),
            studentType: z.number().optional(),
            birthDate: z.string().optional(),
            birthPlace: z.string().optional(),
            gender: z.string().optional(),
            religion: z.string().optional(),
            governorate: z.string().optional(),
            city: z.string().optional(),
            address: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
            faculty: z.string().optional(),
            department: z.string().optional(),
            level: z.string().optional(),
            fatherContactId: z.number().optional(),
            guardianContactId: z.number().optional(),
            userId: z.number().optional(),
          }).optional(),
          fatherInfo: z.object({
            contactId: z.number().optional(),
            fullName: z.string().optional(),
            nationalId: z.string().optional(),
            relation: z.string().optional(),
            job: z.string().optional(),
            phoneNumber: z.string().optional(),
            address: z.string().optional(),
          }).optional(),
          selectedGuardianRelation: z.string().optional(),
          otherGuardianInfo: z.object({
            contactId: z.number().optional(),
            fullName: z.string().optional(),
            nationalId: z.string().optional(),
            relation: z.string().optional(),
            job: z.string().optional(),
            phoneNumber: z.string().optional(),
            address: z.string().optional(),
          }).optional(),
          secondaryInfo: z.object({
            studentId: z.number().optional(),
            secondaryStream: z.string().optional(),
            totalScore: z.number().optional(),
            percentage: z.number().optional(),
            grade: z.string().optional(),
          }).optional(),
          academicInfo: z.object({
            studentId: z.number().optional(),
            currentGPA: z.number().optional(),
            lastYearGrade: z.string().optional(),
          }).optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          try {
            // Store full application form
            const application = await db.createFullApplication({
              userId: ctx.user!.id,
              fullForm: input,
            });

            return { success: true, application };
          } catch (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "فشل تقديم الطلب",
            });
          }
        }),

      // GET /api/student/applications/my-applications
      myApplications: protectedProcedure.query(async ({ ctx }) => {
        try {
          const applications = await db.getApplicationsByUserId(ctx.user!.id);
          return applications || [];
        } catch (error) {
          console.error("Error fetching applications:", error);
          return [];
        }
      }),
    }),

    // ============================================
    // STUDENT COMPLAINTS ROUTES (Swagger: /api/student/complaints/*)
    // ============================================
    complaints: router({
      // POST /api/student/complaints/submit - SubmitComplaintDto
      submit: protectedProcedure
        .input(z.object({
          title: z.string().max(100, "العنوان يجب أن لا يتجاوز 100 حرف"),
          message: z.string().max(500, "الرسالة يجب أن لا تتجاوز 500 حرف"),
        }))
        .mutation(async ({ input, ctx }) => {
          try {
            const complaint = await db.createComplaint({
              userId: ctx.user!.id,
              title: input.title,
              description: input.message,
              status: "pending",
              createdAt: new Date(),
            });

            return { success: true, complaint };
          } catch (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "فشل تقديم الشكوى",
            });
          }
        }),
    }),

    // ============================================
    // STUDENT PAYMENTS ROUTES (Swagger: /api/student/payments/*)
    // ============================================
    payments: router({
      // POST /api/student/payments/pay/{feeId} - FeePaymentDto
      pay: protectedProcedure
        .input(z.object({
          feeId: z.number(),
          studentId: z.number().optional(),
          transactionCode: z.string().optional(),
          receiptFilePath: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          try {
            const payment = await db.createFeePayment({
              feeId: input.feeId,
              userId: ctx.user!.id,
              studentId: input.studentId,
              transactionCode: input.transactionCode,
              receiptFilePath: input.receiptFilePath,
              status: "pending",
              createdAt: new Date(),
            });

            return { success: true, payment };
          } catch (error) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "فشل معالجة الدفع",
            });
          }
        }),
    }),
  }),

  // ============================================
  // GENERAL AUTH ROUTES (Swagger: /api/auth/* & /api/student/auth/*)
  // ============================================
  auth: router({
    me: publicProcedure.query((opts) => {
      return opts.ctx.user || null;
    }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================
  // FILE UPLOAD ROUTER
  // ============================================
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

          ensureUploadDirectory();
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
            message: "فشل معالجة الملف",
          });
        }
      }),

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
