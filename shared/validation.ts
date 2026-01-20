/**
 * Validation Patterns and Rules
 * Centralized validation for the entire application
 */

// Phone Number Validation: 11 digits starting with 01
export const PHONE_REGEX = /^01[0-9]{9}$/;

// Egyptian National ID: 14 digits
export const NATIONAL_ID_REGEX = /^[0-9]{14}$/;

// Arabic Text Only: Arabic characters and spaces
export const ARABIC_ONLY_REGEX = /^[\u0600-\u06FF\s]+$/;

// Validation Functions
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  return PHONE_REGEX.test(phone.trim());
};

export const validateNationalId = (id: string): boolean => {
  if (!id) return false;
  return NATIONAL_ID_REGEX.test(id.trim());
};

export const validateArabicText = (text: string): boolean => {
  if (!text) return false;
  return ARABIC_ONLY_REGEX.test(text.trim());
};

// Error Messages in Arabic
export const VALIDATION_MESSAGES = {
  phoneNumber: {
    required: 'رقم الهاتف مطلوب',
    invalid: 'رقم الهاتف يجب أن يكون 11 رقم يبدأ بـ 01 (مثال: 01000000000)',
    pattern: 'أدخل أرقام فقط',
  },
  nationalId: {
    required: 'الرقم القومي مطلوب',
    invalid: 'الرقم القومي يجب أن يكون 14 رقم بالضبط',
    pattern: 'أدخل أرقام فقط',
  },
  arabicText: {
    required: 'هذا الحقل مطلوب',
    invalid: 'يرجى إدخال نصوص عربية فقط بدون أرقام أو رموز',
    pattern: 'حروف عربية فقط',
  },
  fullName: {
    required: 'الاسم الكامل مطلوب',
    invalid: 'يرجى إدخال الاسم بالعربية فقط',
  },
  studentName: {
    required: 'اسم الطالب مطلوب',
    invalid: 'يرجى إدخال الاسم بالعربية فقط',
  },
  address: {
    required: 'العنوان مطلوب',
    invalid: 'يرجى إدخال العنوان بالعربية فقط',
  },
} as const;

/**
 * Validation Result Type
 */
export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

/**
 * Validate Phone Number
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, message: VALIDATION_MESSAGES.phoneNumber.required };
  }

  if (!/^\d*$/.test(phone.trim())) {
    return { isValid: false, message: VALIDATION_MESSAGES.phoneNumber.pattern };
  }

  if (!validatePhoneNumber(phone)) {
    return { isValid: false, message: VALIDATION_MESSAGES.phoneNumber.invalid };
  }

  return { isValid: true };
};

/**
 * Validate National ID
 */
export const validateNId = (id: string): ValidationResult => {
  if (!id || id.trim() === '') {
    return { isValid: false, message: VALIDATION_MESSAGES.nationalId.required };
  }

  if (!/^\d*$/.test(id.trim())) {
    return { isValid: false, message: VALIDATION_MESSAGES.nationalId.pattern };
  }

  if (!validateNationalId(id)) {
    return { isValid: false, message: VALIDATION_MESSAGES.nationalId.invalid };
  }

  return { isValid: true };
};

/**
 * Validate Arabic Text
 */
export const validateArabic = (text: string, fieldName: string = 'الحقل'): ValidationResult => {
  if (!text || text.trim() === '') {
    return { 
      isValid: false, 
      message: `${fieldName} ${VALIDATION_MESSAGES.arabicText.required}` 
    };
  }

  if (!validateArabicText(text)) {
    return { isValid: false, message: VALIDATION_MESSAGES.arabicText.invalid };
  }

  return { isValid: true };
};

/**
 * Input Sanitization: Remove non-Arabic characters
 */
export const sanitizeArabicInput = (text: string): string => {
  // Keep only Arabic characters and spaces
  return text.replace(/[^\u0600-\u06FF\s]/g, '');
};

/**
 * Input Sanitization: Keep only digits
 */
export const sanitizeDigitsOnly = (text: string): string => {
  // Keep only digits
  return text.replace(/[^\d]/g, '');
};

/**
 * Input Sanitization: Keep only first 11 digits (for phone)
 */
export const sanitizePhoneInput = (text: string): string => {
  const digits = sanitizeDigitsOnly(text);
  return digits.slice(0, 11);
};

/**
 * Input Sanitization: Keep only first 14 digits (for national ID)
 */
export const sanitizeNationalIdInput = (text: string): string => {
  const digits = sanitizeDigitsOnly(text);
  return digits.slice(0, 14);
};

/**
 * Validation Rules for Different Field Types
 */
export const FIELD_VALIDATORS = {
  phone: {
    validate: validatePhone,
    sanitize: sanitizePhoneInput,
    maxLength: 11,
  },
  nationalId: {
    validate: validateNId,
    sanitize: sanitizeNationalIdInput,
    maxLength: 14,
  },
  arabicText: {
    validate: validateArabic,
    sanitize: sanitizeArabicInput,
  },
  email: {
    validate: (email: string) => {
      if (!email) return { isValid: false, message: 'البريد الإلكتروني مطلوب' };
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { isValid: false, message: 'البريد الإلكتروني غير صحيح' };
      }
      return { isValid: true };
    },
  },
} as const;
