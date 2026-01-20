import React, { useState, ChangeEvent, FocusEvent } from 'react';
import { ValidationResult, FIELD_VALIDATORS } from '@/shared/validation';

/**
 * Props for ValidatedInput Component
 */
interface ValidatedInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'tel' | 'email' | 'number';
  required?: boolean;
  disabled?: boolean;
  validationType?: 'phone' | 'nationalId' | 'arabicText' | 'email' | 'text';
  maxLength?: number;
  error?: string;
  onValidationChange?: (isValid: boolean, message?: string) => void;
  className?: string;
  inputClassName?: string;
}

/**
 * ValidatedInput Component
 * Reusable component for validated inputs with real-time validation
 */
export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  validationType = 'text',
  maxLength,
  error,
  onValidationChange,
  className = '',
  inputClassName = '',
}) => {
  const [validationError, setValidationError] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  /**
   * Handle Input Change with Sanitization
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // Sanitize input based on validation type
    if (validationType === 'phone') {
      inputValue = FIELD_VALIDATORS.phone.sanitize(inputValue);
    } else if (validationType === 'nationalId') {
      inputValue = FIELD_VALIDATORS.nationalId.sanitize(inputValue);
    } else if (validationType === 'arabicText') {
      inputValue = FIELD_VALIDATORS.arabicText.sanitize(inputValue);
    }

    // Apply max length if specified
    if (maxLength && inputValue.length > maxLength) {
      inputValue = inputValue.slice(0, maxLength);
    }

    onChange(inputValue);

    // Real-time validation (only if touched)
    if (isTouched) {
      validateField(inputValue);
    }
  };

  /**
   * Validate Field
   */
  const validateField = (fieldValue: string) => {
    if (!required && fieldValue === '') {
      setValidationError('');
      onValidationChange?.(true);
      return;
    }

    let result: ValidationResult;

    if (validationType === 'phone') {
      result = FIELD_VALIDATORS.phone.validate(fieldValue);
    } else if (validationType === 'nationalId') {
      result = FIELD_VALIDATORS.nationalId.validate(fieldValue);
    } else if (validationType === 'arabicText') {
      result = FIELD_VALIDATORS.arabicText.validate(fieldValue, label);
    } else if (validationType === 'email') {
      result = FIELD_VALIDATORS.email.validate(fieldValue);
    } else {
      result = { isValid: true };
    }

    setValidationError(result.message || '');
    onValidationChange?.(result.isValid, result.message);
  };

  /**
   * Handle Blur
   */
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setIsTouched(true);
    validateField(e.target.value);
    onBlur?.(e.target.value);
  };

  /**
   * Handle Focus
   */
  const handleFocus = () => {
    setIsFocused(true);
  };

  const displayError = validationError || error;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label htmlFor={name} className="block text-sm font-medium text-[#132a4f]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Field */}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={`
          w-full px-4 py-2 border rounded-lg
          bg-white text-right transition-colors
          placeholder-[#999]
          ${
            displayError
              ? 'border-red-500 focus:border-red-600 focus:ring-red-500'
              : isFocused
              ? 'border-[#0292B3] focus:border-[#0292B3] focus:ring-2 focus:ring-[#0292B3] focus:ring-opacity-30'
              : 'border-gray-300 hover:border-gray-400'
          }
          disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
          ${inputClassName}
        `}
      />

      {/* Error Message */}
      {displayError && (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <span className="inline-block">✕</span>
          {displayError}
        </p>
      )}

      {/* Helper Text */}
      {!displayError && (
        <p className="text-xs text-[#619cba]">
          {validationType === 'phone' && 'أدخل رقم هاتف صحيح (11 رقم يبدأ بـ 01)'}
          {validationType === 'nationalId' && 'أدخل الرقم القومي (14 رقم)'}
          {validationType === 'arabicText' && 'أدخل النص بالعربية فقط'}
          {validationType === 'email' && 'أدخل البريد الإلكتروني الصحيح'}
        </p>
      )}
    </div>
  );
};

export default ValidatedInput;
