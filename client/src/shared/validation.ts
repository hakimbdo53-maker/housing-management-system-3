/**
 * Validation Module
 * Centralized validation functions for forms
 */

// ====== REGEX PATTERNS ======

/** Phone Number: 11 digits starting with 01 (Egypt format) */
export const PHONE_REGEX = /^01[0-9]{9}$/;

/** National ID: exactly 14 digits */
export const NATIONAL_ID_REGEX = /^[0-9]{14}$/;

/** Arabic Text: Arabic characters and spaces only */
export const ARABIC_ONLY_REGEX = /^[\u0600-\u06FF\s]+$/;

// ====== VALIDATION FUNCTIONS ======

/**
 * Validate Egyptian phone number
 * Format: 01XXXXXXXXX (11 digits starting with 01)
 */
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  return PHONE_REGEX.test(phone.trim());
};

/**
 * Validate Egyptian National ID
 * Format: 14 digits exactly
 */
export const validateNationalId = (id: string): boolean => {
  if (!id) return false;
  return NATIONAL_ID_REGEX.test(id.trim());
};

/**
 * Validate Arabic text only (no English, numbers, or special characters)
 */
export const validateArabicText = (text: string): boolean => {
  if (!text) return false;
  return ARABIC_ONLY_REGEX.test(text.trim());
};

// ====== SANITIZATION FUNCTIONS ======

/**
 * Sanitize phone input - allow only digits
 */
export const sanitizePhoneInput = (input: string): string => {
  return input.replace(/[^\d]/g, '').slice(0, 11);
};

/**
 * Sanitize national ID input - allow only digits
 */
export const sanitizeNationalIdInput = (input: string): string => {
  return input.replace(/[^\d]/g, '').slice(0, 14);
};

/**
 * Sanitize Arabic input - allow only Arabic characters and spaces
 */
export const sanitizeArabicInput = (input: string): string => {
  return input
    .replace(/[^\u0600-\u06FF\s]/g, '') // Remove non-Arabic characters
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
};

// ====== VALIDATION RESULT TYPE ======

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

// ====== WRAPPER FUNCTIONS WITH MESSAGES ======

/**
 * Validate phone number with error message
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return {
      isValid: false,
      message: 'رقم الهاتف مطلوب',
    };
  }

  if (!validatePhoneNumber(phone)) {
    return {
      isValid: false,
      message: 'رقم الهاتف يجب أن يكون 11 رقم يبدأ بـ 01 (مثال: 01000000000)',
    };
  }

  return {
    isValid: true,
    message: '',
  };
};

/**
 * Validate national ID with error message
 */
export const validateNId = (id: string): ValidationResult => {
  if (!id) {
    return {
      isValid: false,
      message: 'الرقم القومي مطلوب',
    };
  }

  if (!validateNationalId(id)) {
    return {
      isValid: false,
      message: 'الرقم القومي يجب أن يكون 14 رقم بالضبط',
    };
  }

  return {
    isValid: true,
    message: '',
  };
};

/**
 * Validate Arabic text with error message
 */
export const validateArabic = (text: string): ValidationResult => {
  if (!text) {
    return {
      isValid: false,
      message: 'هذا الحقل مطلوب',
    };
  }

  if (!validateArabicText(text)) {
    return {
      isValid: false,
      message: 'يرجى إدخال نصوص عربية فقط بدون أرقام أو رموز',
    };
  }

  return {
    isValid: true,
    message: '',
  };
};

// ====== ERROR MESSAGES MAP ======

export const VALIDATION_MESSAGES = {
  phoneNumber: {
    required: 'رقم الهاتف مطلوب',
    invalid: 'رقم الهاتف يجب أن يكون 11 رقم يبدأ بـ 01',
  },
  nationalId: {
    required: 'الرقم القومي مطلوب',
    invalid: 'الرقم القومي يجب أن يكون 14 رقم بالضبط',
  },
  arabicText: {
    required: 'هذا الحقل مطلوب',
    invalid: 'يرجى إدخال نصوص عربية فقط',
  },
} as const;

// ====== FIELD VALIDATORS CONFIGURATION ======

export const FIELD_VALIDATORS = {
  phone: {
    pattern: PHONE_REGEX,
    sanitize: sanitizePhoneInput,
    validate: validatePhone,
    maxLength: 11,
  },
  nationalId: {
    pattern: NATIONAL_ID_REGEX,
    sanitize: sanitizeNationalIdInput,
    validate: validateNId,
    maxLength: 14,
  },
  arabicText: {
    pattern: ARABIC_ONLY_REGEX,
    sanitize: sanitizeArabicInput,
    validate: validateArabic,
  },
} as const;
