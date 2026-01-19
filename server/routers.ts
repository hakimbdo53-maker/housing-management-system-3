import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { sdk } from "./_core/sdk";
import { TRPCError } from "@trpc/server";

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

  // Applications Router
  applications: router({
    create: protectedProcedure
      .input(z.object({
        studentType: z.enum(['new', 'old']),
        fullName: z.string().min(3),
        studentId: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().min(10),
        major: z.string().min(1),
        gpa: z.string().min(1),
        address: z.string().min(1),
        governorate: z.string().min(1),
        familyIncome: z.string().min(1),
        additionalInfo: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const application = await db.createApplication({
          userId: ctx.user!.id,
          studentType: input.studentType,
          fullName: input.fullName,
          studentId: input.studentId,
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
});

export type AppRouter = typeof appRouter;
