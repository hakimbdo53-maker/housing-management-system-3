/**
 * Backend Validation Schemas using Zod
 * Centralized validation for all API inputs
 * ✅ All schemas match Swagger spec exactly
 */

import { z } from 'zod';

// Regex Patterns (matching frontend)
const PHONE_PATTERN = /^01[0-9]{9}$/;
const NATIONAL_ID_PATTERN = /^[0-9]{14}$/;
const ARABIC_ONLY_PATTERN = /^[\u0600-\u06FF\s]+$/;

/**
 * Phone Number Schema (Swagger validation)
 */
export const phoneSchema = z
  .string()
  .min(1, 'رقم الهاتف مطلوب')
  .regex(/^\d*$/, 'أدخل أرقام فقط')
  .regex(PHONE_PATTERN, 'رقم الهاتف يجب أن يكون 11 رقم يبدأ بـ 01');

/**
 * National ID Schema (Swagger validation)
 */
export const nationalIdSchema = z
  .string()
  .min(1, 'الرقم القومي مطلوب')
  .regex(/^\d*$/, 'أدخل أرقام فقط')
  .regex(NATIONAL_ID_PATTERN, 'الرقم القومي يجب أن يكون 14 رقم بالضبط');

/**
 * Arabic Text Schema
 */
export const arabicTextSchema = z
  .string()
  .min(1, 'هذا الحقل مطلوب')
  .regex(ARABIC_ONLY_PATTERN, 'يرجى إدخال نصوص عربية فقط بدون أرقام أو رموز');

// ============================================
// STUDENT AUTH SCHEMAS (Swagger: /api/student/auth/*)
// ============================================

/**
 * RegisterDto Schema (Swagger spec)
 * Required: userName, password, role
 * Optional: studentId
 */
export const registerSchema = z.object({
  userName: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
  role: z.string().min(1, "الدور مطلوب"),
  studentId: z.number().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * LoginDto Schema (Swagger spec)
 * Required: username (max 50, min 1), password (min 6)
 */
export const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب").max(50, "اسم المستخدم طويل جداً"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================
// STUDENT APPLICATIONS SCHEMAS (Swagger: /api/student/applications/*)
// ============================================

/**
 * SubmitComplaintDto Schema (Swagger spec)
 * Required: title (max 100), message (max 500)
 */
export const submitComplaintSchema = z.object({
  title: z.string().max(100, "العنوان يجب أن لا يتجاوز 100 حرف"),
  message: z.string().max(500, "الرسالة يجب أن لا تتجاوز 500 حرف"),
});

export type SubmitComplaintInput = z.infer<typeof submitComplaintSchema>;

/**
 * FeePaymentDto Schema (Swagger spec)
 * Optional: studentId, transactionCode, receiptFilePath
 */
export const feePaymentSchema = z.object({
  studentId: z.number().optional(),
  transactionCode: z.string().optional(),
  receiptFilePath: z.string().optional(),
});

export type FeePaymentInput = z.infer<typeof feePaymentSchema>;

// ============================================
// LEGACY SCHEMAS (Keep for backward compatibility)
// ============================================

/**
 * Application Submission Schema
 */
export const applicationSubmissionSchema = z.object({
  // Student Info
  studentType: z.enum(['new', 'old']),
  fullName: arabicTextSchema,
  studentId: z.string().min(1, 'الرقم الجامعي مطلوب'),
  nationalId: nationalIdSchema.optional(),
  
  // Contact Info
  phone: phoneSchema,
  email: z.preprocess(
    (val) => val === undefined || val === '' ? 'student@university.edu.eg' : val,
    z.string().email('البريد الإلكتروني غير صحيح')
  ),
  
  // Academic Info
  major: arabicTextSchema,
  gpa: z.string().min(1, 'المعدل مطلوب'),
  
  // Address Info
  address: arabicTextSchema,
  governorate: arabicTextSchema,
  
  // Financial Info
  familyIncome: z.string().min(1, 'الدخل العائلي مطلوب'),
  
  // Optional Info
  additionalInfo: z.string().optional(),
});

export type ApplicationSubmissionInput = z.infer<typeof applicationSubmissionSchema>;

/**
 * Student Registration Schema
 */
export const studentRegistrationSchema = z.object({
  username: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phoneNumber: phoneSchema.optional(),
  nationalId: nationalIdSchema.optional(),
});

export type StudentRegistrationInput = z.infer<typeof studentRegistrationSchema>;

/**
 * Student Profile Update Schema
 */
export const studentProfileUpdateSchema = z.object({
  fullName: arabicTextSchema.optional(),
  phoneNumber: phoneSchema.optional(),
  nationalId: nationalIdSchema.optional(),
  address: arabicTextSchema.optional(),
  governorate: arabicTextSchema.optional(),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional(),
});

export type StudentProfileUpdateInput = z.infer<typeof studentProfileUpdateSchema>;

/**
 * Student Info Schema (with national ID)
 */
export const studentInfoSchema = z.object({
  studentId: z.string().min(1),
  fullName: arabicTextSchema,
  nationalId: nationalIdSchema.optional(),
  phone: phoneSchema.optional(),
  email: z.string().email().optional(),
  faculty: arabicTextSchema,
  department: arabicTextSchema,
  level: z.string().optional(),
  address: arabicTextSchema.optional(),
  governorate: arabicTextSchema.optional(),
});

/**
 * Family Contact Schema
 */
export const familyContactSchema = z.object({
  fullName: arabicTextSchema,
  nationalId: nationalIdSchema.optional(),
  relation: arabicTextSchema,
  job: arabicTextSchema.optional(),
  phoneNumber: phoneSchema,
  address: arabicTextSchema.optional(),
  governorate: arabicTextSchema.optional(),
});

export type FamilyContactInput = z.infer<typeof familyContactSchema>;

/**
 * Validation Error Formatter
 * Format Zod validation errors to user-friendly messages
 */
export const formatValidationError = (error: z.ZodError): string => {
  const firstError = error.issues[0];
  return firstError?.message || 'تحقق من البيانات المدخلة';
};

/**
 * Safe Parse Wrapper
 * Returns either data or formatted error message
 */
export const safeValidate = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: formatValidationError(result.error),
  };
};
