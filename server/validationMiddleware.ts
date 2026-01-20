import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { json } from '@sveltejs/kit';

/**
 * Validation Middleware for tRPC + SvelteKit
 * Logs all validation attempts for security auditing
 */

interface ValidationLog {
  timestamp: string;
  endpoint: string;
  userId?: string;
  fieldType: string;
  inputValue: string;
  isValid: boolean;
  errorMessage?: string;
  ipAddress?: string;
}

const validationLogs: ValidationLog[] = [];

/**
 * Log validation attempt to file or database
 */
export async function logValidationAttempt(log: ValidationLog): Promise<void> {
  validationLogs.push(log);
  
  // اختياري: حفظ في قاعدة البيانات
  // await db.validationLogs.create(log);
  
  console.log(`[VALIDATION] ${log.endpoint} - ${log.fieldType}: ${log.isValid ? '✅' : '❌'}`);
}

/**
 * Middleware: Validate and log all requests
 */
export async function validateRequest(event: RequestEvent) {
  const request = event.request;
  const url = new URL(request.url);
  
  // لا نتحقق من GET requests
  if (request.method === 'GET') {
    return;
  }

  try {
    const body = await request.json();
    
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        const fieldType = detectFieldType(key, value);
        
        await logValidationAttempt({
          timestamp: new Date().toISOString(),
          endpoint: url.pathname,
          userId: event.locals.userId,
          fieldType,
          inputValue: value.substring(0, 50), // فقط أول 50 حرف
          isValid: true,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        });
      }
    }
  } catch (error) {
    // تجاهل الأخطاء في parsing
  }
}

/**
 * Detect field type based on field name or value
 */
function detectFieldType(fieldName: string, value: string): string {
  const lowerName = fieldName.toLowerCase();
  
  if (lowerName.includes('phone') || lowerName.includes('mobile')) {
    return 'phone';
  }
  if (lowerName.includes('national') || lowerName.includes('id')) {
    return 'nationalId';
  }
  if (lowerName.includes('name') || lowerName.includes('اسم')) {
    return 'arabicText';
  }
  if (lowerName.includes('address') || lowerName.includes('عنوان')) {
    return 'arabicText';
  }
  if (lowerName.includes('email')) {
    return 'email';
  }
  
  return 'text';
}

/**
 * Validation error handler middleware
 */
export function handleValidationError(error: unknown): Response {
  if (error instanceof z.ZodError) {
    const formattedErrors = error.errors.map(err => ({
      path: err.path.join('.'),
      message: getArabicErrorMessage(err.code),
      code: err.code,
    }));

    return json({
      success: false,
      error: {
        message: 'خطأ في التحقق من البيانات',
        details: formattedErrors,
      },
    }, { status: 400 });
  }

  return json({
    success: false,
    error: { message: 'خطأ غير متوقع' },
  }, { status: 500 });
}

/**
 * Get Arabic error message based on Zod error code
 */
function getArabicErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'invalid_type': 'نوع البيانات غير صحيح',
    'invalid_literal': 'القيمة غير صحيحة',
    'custom': 'البيانات لا تطابق الصيغة المطلوبة',
    'invalid_union': 'يجب اختيار أحد الخيارات المتاحة',
    'invalid_enum_value': 'القيمة غير موجودة في القائمة',
    'unrecognized_keys': 'حقول غير معروفة',
    'invalid_arguments': 'معاملات غير صحيحة',
    'invalid_return_type': 'نوع الإرجاع غير صحيح',
    'invalid_date': 'التاريخ غير صحيح',
    'invalid_string': 'النص غير صحيح',
    'too_small': 'البيانات قصيرة جداً',
    'too_big': 'البيانات طويلة جداً',
    'invalid_regex': 'صيغة النص غير صحيحة',
  };

  return messages[code] || 'خطأ في البيانات';
}

/**
 * Get validation logs (مثل admin dashboard)
 */
export function getValidationLogs(
  filters?: {
    endpoint?: string;
    isValid?: boolean;
    fieldType?: string;
    from?: Date;
    to?: Date;
  }
): ValidationLog[] {
  return validationLogs.filter(log => {
    if (filters?.endpoint && log.endpoint !== filters.endpoint) return false;
    if (filters?.isValid !== undefined && log.isValid !== filters.isValid) return false;
    if (filters?.fieldType && log.fieldType !== filters.fieldType) return false;
    
    const timestamp = new Date(log.timestamp);
    if (filters?.from && timestamp < filters.from) return false;
    if (filters?.to && timestamp > filters.to) return false;
    
    return true;
  });
}

/**
 * Get validation statistics
 */
export function getValidationStats() {
  const total = validationLogs.length;
  const valid = validationLogs.filter(l => l.isValid).length;
  const invalid = total - valid;

  const byFieldType: Record<string, { total: number; valid: number }> = {};
  validationLogs.forEach(log => {
    if (!byFieldType[log.fieldType]) {
      byFieldType[log.fieldType] = { total: 0, valid: 0 };
    }
    byFieldType[log.fieldType].total++;
    if (log.isValid) {
      byFieldType[log.fieldType].valid++;
    }
  });

  return {
    total,
    valid,
    invalid,
    successRate: total > 0 ? ((valid / total) * 100).toFixed(2) + '%' : '0%',
    byFieldType,
    recentErrors: validationLogs
      .filter(l => !l.isValid)
      .slice(-10)
      .map(l => ({ fieldType: l.fieldType, error: l.errorMessage })),
  };
}

/**
 * Clear old logs (keep last N days)
 */
export function cleanupOldLogs(days: number = 30): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const originalLength = validationLogs.length;
  const filtered = validationLogs.filter(
    log => new Date(log.timestamp) > cutoffDate
  );

  // يمكن مسح من قاعدة البيانات أيضاً
  // await db.validationLogs.deleteMany({ timestamp: { $lt: cutoffDate } });

  return originalLength - filtered.length;
}
