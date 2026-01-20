import { useState, useCallback, useRef, useEffect } from 'react';

interface ValidationRule {
  pattern: RegExp;
  message: string;
  minLength?: number;
  maxLength?: number;
}

export interface ValidationState {
  value: string;
  isValid: boolean;
  error?: string;
  isTouched: boolean;
  isDirty: boolean;
}

/**
 * Advanced Validation Hook
 * المزايا:
 * - التحقق من الصحة في الوقت الفعلي
 * - دعم قواعد متعددة
 * - تتبع حالة التعديل والـ Touch
 * - دعم التحقق غير المتزامن
 */
export function useValidation(
  initialValue: string = '',
  rules?: ValidationRule,
  asyncValidate?: (value: string) => Promise<boolean>
) {
  const [state, setState] = useState<ValidationState>({
    value: initialValue,
    isValid: true,
    isTouched: false,
    isDirty: false,
  });

  const [isValidating, setIsValidating] = useState(false);
  const validationTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Validate value against rules
   */
  const validate = useCallback(
    (value: string): { isValid: boolean; error?: string } => {
      if (!rules) return { isValid: true };

      // Check min length
      if (rules.minLength && value.length < rules.minLength) {
        return {
          isValid: false,
          error: `الحد الأدنى هو ${rules.minLength} أحرف`,
        };
      }

      // Check max length
      if (rules.maxLength && value.length > rules.maxLength) {
        return {
          isValid: false,
          error: `الحد الأقصى هو ${rules.maxLength} أحرف`,
        };
      }

      // Check pattern
      if (!rules.pattern.test(value)) {
        return { isValid: false, error: rules.message };
      }

      return { isValid: true };
    },
    [rules]
  );

  /**
   * Handle value change
   */
  const handleChange = useCallback(
    async (newValue: string) => {
      const validation = validate(newValue);

      setState(prev => ({
        ...prev,
        value: newValue,
        isValid: validation.isValid,
        error: validation.error,
        isDirty: true,
      }));

      // Handle async validation
      if (asyncValidate && validation.isValid) {
        setIsValidating(true);

        // Cancel previous validation
        if (validationTimeoutRef.current) {
          clearTimeout(validationTimeoutRef.current);
        }

        validationTimeoutRef.current = setTimeout(async () => {
          const isAsyncValid = await asyncValidate(newValue);
          
          setState(prev => ({
            ...prev,
            isValid: isAsyncValid,
            error: !isAsyncValid
              ? 'هذه القيمة غير متاحة'
              : undefined,
          }));

          setIsValidating(false);
        }, 500); // Debounce 500ms
      }
    },
    [validate, asyncValidate]
  );

  /**
   * Handle blur
   */
  const handleBlur = useCallback(() => {
    setState(prev => ({
      ...prev,
      isTouched: true,
    }));
  }, []);

  /**
   * Reset to initial value
   */
  const reset = useCallback(() => {
    setState({
      value: initialValue,
      isValid: true,
      isTouched: false,
      isDirty: false,
    });
  }, [initialValue]);

  /**
   * Set error manually
   */
  const setError = useCallback((error: string | undefined) => {
    setState(prev => ({
      ...prev,
      error,
      isValid: !error,
    }));
  }, []);

  return {
    ...state,
    handleChange,
    handleBlur,
    reset,
    setError,
    isValidating,
  };
}

/**
 * Multi-field validation hook
 * للتعامل مع نماذج متعددة الحقول
 */
export function useFormValidation(
  initialValues: Record<string, string>,
  validationRules: Record<string, ValidationRule>,
  onSubmit?: (values: Record<string, string>) => Promise<void>
) {
  const [formState, setFormState] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validate single field
   */
  const validateField = useCallback(
    (fieldName: string, value: string): string | undefined => {
      const rules = validationRules[fieldName];
      if (!rules) return undefined;

      // Check min length
      if (rules.minLength && value.length < rules.minLength) {
        return `الحد الأدنى هو ${rules.minLength} أحرف`;
      }

      // Check max length
      if (rules.maxLength && value.length > rules.maxLength) {
        return `الحد الأقصى هو ${rules.maxLength} أحرف`;
      }

      // Check pattern
      if (!rules.pattern.test(value)) {
        return rules.message;
      }

      return undefined;
    },
    [validationRules]
  );

  /**
   * Validate all fields
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    Object.entries(formState).forEach(([fieldName, value]) => {
      const error = validateField(fieldName, value);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState, validateField]);

  /**
   * Handle field change
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      setFormState(prev => ({
        ...prev,
        [name]: value,
      }));

      // Validate if field has been touched
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors(prev => ({
          ...prev,
          [name]: error || '',
        }));
      }
    },
    [touched, validateField]
  );

  /**
   * Handle field blur
   */
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      setTouched(prev => ({
        ...prev,
        [name]: true,
      }));

      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error || '',
      }));
    },
    [validateField]
  );

  /**
   * Handle form submit
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(formState);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [validateForm, formState, onSubmit]
  );

  /**
   * Reset form
   */
  const reset = useCallback(() => {
    setFormState(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  /**
   * Get field props (for spreading on input)
   */
  const getFieldProps = useCallback(
    (fieldName: string) => ({
      name: fieldName,
      value: formState[fieldName] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      'aria-invalid': !!errors[fieldName],
      'aria-describedby': errors[fieldName]
        ? `${fieldName}-error`
        : undefined,
    }),
    [formState, handleChange, handleBlur, errors]
  );

  return {
    formState,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validateField,
    validateForm,
    getFieldProps,
    isValid: Object.keys(errors).length === 0 && Object.keys(touched).length > 0,
  };
}

/**
 * Debounced validation hook
 * للتحقق من الصحة بعد تأخير قصير (مفيد للتحقق غير المتزامن)
 */
export function useDebouncedValidation(
  value: string,
  validate: (value: string) => Promise<boolean>,
  delay: number = 500
) {
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsValidating(true);

    timeoutRef.current = setTimeout(async () => {
      try {
        const isValid = await validate(value);
        setResult(isValid);
      } finally {
        setIsValidating(false);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, validate, delay]);

  return { isValidating, result };
}

/**
 * Pattern validation hook
 * للتحقق من صيغة معينة فقط
 */
export function usePatternValidation(pattern: RegExp, initialValue: string = '') {
  const [value, setValue] = useState(initialValue);
  const [isValid, setIsValid] = useState(true);

  const handleChange = useCallback(
    (newValue: string) => {
      // فقط اسمح بالأحرف المطابقة للنمط
      const matched = newValue.match(new RegExp(`[${pattern.source}]`, 'g'));
      const validValue = matched ? matched.join('') : '';

      setValue(validValue);
      setIsValid(pattern.test(validValue) || validValue === '');
    },
    [pattern]
  );

  return { value, isValid, setValue, handleChange };
}
