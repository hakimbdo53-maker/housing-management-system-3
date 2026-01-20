import React, { useState, useCallback } from 'react';
import ValidatedInput from '../components/ValidatedInput';
import { validatePhone, validateNId, validateArabic } from '../../shared/validation';
import { applicationSubmissionSchema } from '../../server/validationSchemas';
import type { ValidationState } from '../hooks/useValidation';

interface StudentApplication {
  studentType: 'new' | 'old';
  fullName: string;
  studentId: string;
  nationalId: string;
  email: string;
  phone: string;
  major: string;
  gpa: string;
  address: string;
  governorate: string;
  familyIncome: string;
  additionalInfo?: string;
}

interface FormErrors {
  [key: string]: string;
}

/**
 * Advanced Student Application Form with Comprehensive Validation
 * نموذج تطبيق الطالب المتقدم مع التحقق الشامل
 */
const AdvancedApplicationForm: React.FC = () => {
  const [formData, setFormData] = useState<Partial<StudentApplication>>({
    studentType: 'new',
    fullName: '',
    studentId: '',
    nationalId: '',
    email: '',
    phone: '',
    major: '',
    gpa: '',
    address: '',
    governorate: '',
    familyIncome: '',
    additionalInfo: '',
  });

  const [validationErrors, setValidationErrors] = useState<FormErrors>({});
  const [fieldsTouched, setFieldsTouched] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  /**
   * Handle field value change
   */
  const handleFieldChange = useCallback(
    (fieldName: string, value: string) => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: value,
      }));

      // التحقق تلقائياً إذا تم اللمس سابقاً
      if (fieldsTouched.has(fieldName)) {
        validateField(fieldName, value);
      }
    },
    [fieldsTouched]
  );

  /**
   * Handle field blur (on field exit)
   */
  const handleFieldBlur = useCallback((fieldName: string) => {
    setFieldsTouched(prev => new Set([...prev, fieldName]));
    validateField(fieldName, formData[fieldName as keyof StudentApplication] as string);
  }, [formData]);

  /**
   * Validate single field based on type
   */
  const validateField = useCallback(
    (fieldName: string, value: string) => {
      if (!value?.trim()) {
        setValidationErrors(prev => ({
          ...prev,
          [fieldName]: `${getLabelForField(fieldName)} مطلوب`,
        }));
        return false;
      }

      let isValid = true;
      let errorMessage = '';

      switch (fieldName) {
        case 'fullName':
        case 'address':
        case 'major':
        case 'governorate':
          // Arabic text validation
          const arabicResult = validateArabic(value);
          isValid = arabicResult.isValid;
          errorMessage = arabicResult.message;
          break;

        case 'nationalId':
          // National ID validation
          const nIdResult = validateNId(value);
          isValid = nIdResult.isValid;
          errorMessage = nIdResult.message;
          break;

        case 'phone':
          // Phone validation
          const phoneResult = validatePhone(value);
          isValid = phoneResult.isValid;
          errorMessage = phoneResult.message;
          break;

        case 'email':
          // Email validation
          isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          errorMessage = isValid ? '' : 'البريد الإلكتروني غير صحيح';
          break;

        case 'gpa':
          // GPA validation (0.0 - 4.0)
          const gpaNum = parseFloat(value);
          isValid = !isNaN(gpaNum) && gpaNum >= 0 && gpaNum <= 4;
          errorMessage = isValid ? '' : 'المعدل يجب أن يكون بين 0 و 4';
          break;

        case 'studentId':
          // Student ID validation (any non-empty value)
          isValid = value.trim().length > 0;
          errorMessage = isValid ? '' : 'الرقم الجامعي مطلوب';
          break;

        case 'familyIncome':
          // Family income selection
          isValid = value !== '';
          errorMessage = isValid ? '' : 'يرجى اختيار الدخل العائلي';
          break;

        default:
          break;
      }

      if (errorMessage) {
        setValidationErrors(prev => ({
          ...prev,
          [fieldName]: errorMessage,
        }));
        return false;
      } else {
        setValidationErrors(prev => {
          const { [fieldName]: _, ...rest } = prev;
          return rest;
        });
        return true;
      }
    },
    []
  );

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};
    let isFormValid = true;

    // Required fields
    const requiredFields = [
      'fullName',
      'studentId',
      'nationalId',
      'email',
      'phone',
      'major',
      'gpa',
      'address',
      'governorate',
      'familyIncome',
    ];

    requiredFields.forEach(field => {
      const value = formData[field as keyof StudentApplication] as string;

      if (!validateField(field, value)) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }, [formData, validateField]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mark all fields as touched
    const allFields = new Set([
      'fullName',
      'studentId',
      'nationalId',
      'email',
      'phone',
      'major',
      'gpa',
      'address',
      'governorate',
      'familyIncome',
    ]);
    setFieldsTouched(allFields);

    // Validate all fields
    if (!validateForm()) {
      setSubmitError('يرجى إصلاح الأخطاء أعلاه');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Validate data before sending
      const validatedData = applicationSubmissionSchema.parse(formData);

      // Send to server
      const response = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      // Safely parse error response if not ok
      let errorData = null;
      if (!response.ok) {
        try {
          const errorResponse = response.clone();
          const contentType = errorResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorText = await errorResponse.text();
            if (errorText && errorText.trim()) {
              errorData = JSON.parse(errorText);
            }
          }
        } catch (parseError) {
          // If we can't parse error response, use HTTP status
          console.warn('Failed to parse error response:', parseError);
        }
        
        throw new Error(
          errorData?.error?.message || errorData?.message || `فشل إرسال الطلب (HTTP ${response.status})`
        );
      }

      // Handle 204 No Content as success
      let result;
      if (response.status === 204) {
        result = { success: true };
      } else {
        // Safely parse success response
        try {
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Invalid Content-Type: ${contentType || 'missing'}`);
          }

          const responseText = await response.text();
          if (!responseText || responseText.trim() === '') {
            // Treat empty response as success for non-204 status
            result = { success: true };
          } else {
            result = JSON.parse(responseText);
          }
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new Error(`فشل معالجة الرد: ${parseError.message}`);
          }
          throw parseError;
        }
      }

      setSubmitSuccess(true);

      // Reset form
      setFormData({
        studentType: 'new',
        fullName: '',
        studentId: '',
        nationalId: '',
        email: '',
        phone: '',
        major: '',
        gpa: '',
        address: '',
        governorate: '',
        familyIncome: '',
        additionalInfo: '',
      });
      setValidationErrors({});
      setFieldsTouched(new Set());

      // Show success message for 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'حدث خطأ أثناء معالجة طلبك';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Get label for field
   */
  function getLabelForField(fieldName: string): string {
    const labels: Record<string, string> = {
      fullName: 'الاسم الكامل',
      studentId: 'الرقم الجامعي',
      nationalId: 'الرقم القومي',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      major: 'التخصص',
      gpa: 'المعدل',
      address: 'العنوان',
      governorate: 'المحافظة',
      familyIncome: 'الدخل العائلي',
      additionalInfo: 'معلومات إضافية',
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Check if field has error and is touched
   */
  const shouldShowError = (fieldName: string): boolean => {
    return !!(
      fieldsTouched.has(fieldName) &&
      validationErrors[fieldName]
    );
  };

  /**
   * Check if all required fields are valid
   */
  const isFormValid = (): boolean => {
    const requiredFields = [
      'fullName',
      'studentId',
      'nationalId',
      'email',
      'phone',
      'major',
      'gpa',
      'address',
      'governorate',
      'familyIncome',
    ];

    return requiredFields.every(
      field =>
        formData[field as keyof StudentApplication] &&
        !validationErrors[field]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            ✅ تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً.
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            ❌ {submitError}
          </div>
        )}

        <h1 className="text-3xl font-bold mb-6 text-center">طلب الحصول على السكن الجامعي</h1>

        <form onSubmit={handleSubmit} noValidate>
          {/* Student Type Selection */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-3">
              نوع الطالب <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="studentType"
                  value="new"
                  checked={formData.studentType === 'new'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    studentType: 'new'
                  }))}
                  className="ml-2"
                />
                <span>طالب جديد</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="studentType"
                  value="old"
                  checked={formData.studentType === 'old'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    studentType: 'old'
                  }))}
                  className="ml-2"
                />
                <span>طالب قديم</span>
              </label>
            </div>
          </div>

          {/* Full Name */}
          <ValidatedInput
            label="الاسم الكامل"
            name="fullName"
            value={formData.fullName || ''}
            onChange={(value) => handleFieldChange('fullName', value)}
            onBlur={() => handleFieldBlur('fullName')}
            validationType="arabicText"
            placeholder="محمد أحمد علي"
            required
            error={shouldShowError('fullName') ? validationErrors['fullName'] : undefined}
            className="mb-6"
          />

          {/* Student ID */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2">
              الرقم الجامعي <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId || ''}
              onChange={(e) => handleFieldChange('studentId', e.target.value)}
              onBlur={() => handleFieldBlur('studentId')}
              placeholder="2024001"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                shouldShowError('studentId')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {shouldShowError('studentId') && (
              <p className="text-red-500 text-sm mt-1">{validationErrors['studentId']}</p>
            )}
          </div>

          {/* National ID */}
          <ValidatedInput
            label="الرقم القومي"
            name="nationalId"
            value={formData.nationalId || ''}
            onChange={(value) => handleFieldChange('nationalId', value)}
            onBlur={() => handleFieldBlur('nationalId')}
            validationType="nationalId"
            placeholder="30303030303030"
            required
            maxLength={14}
            error={shouldShowError('nationalId') ? validationErrors['nationalId'] : undefined}
            className="mb-6"
          />

          {/* Email */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={() => handleFieldBlur('email')}
              placeholder="student@university.edu.eg"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                shouldShowError('email')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {shouldShowError('email') && (
              <p className="text-red-500 text-sm mt-1">{validationErrors['email']}</p>
            )}
          </div>

          {/* Phone */}
          <ValidatedInput
            label="رقم الهاتف"
            name="phone"
            value={formData.phone || ''}
            onChange={(value) => handleFieldChange('phone', value)}
            onBlur={() => handleFieldBlur('phone')}
            validationType="phone"
            placeholder="01000000000"
            required
            maxLength={11}
            error={shouldShowError('phone') ? validationErrors['phone'] : undefined}
            className="mb-6"
          />

          {/* Major */}
          <ValidatedInput
            label="التخصص"
            name="major"
            value={formData.major || ''}
            onChange={(value) => handleFieldChange('major', value)}
            onBlur={() => handleFieldBlur('major')}
            validationType="arabicText"
            placeholder="هندسة الحاسوب"
            required
            error={shouldShowError('major') ? validationErrors['major'] : undefined}
            className="mb-6"
          />

          {/* GPA */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2">
              المعدل التراكمي <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="gpa"
              value={formData.gpa || ''}
              onChange={(e) => handleFieldChange('gpa', e.target.value)}
              onBlur={() => handleFieldBlur('gpa')}
              placeholder="3.5"
              min="0"
              max="4"
              step="0.1"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                shouldShowError('gpa')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {shouldShowError('gpa') && (
              <p className="text-red-500 text-sm mt-1">{validationErrors['gpa']}</p>
            )}
          </div>

          {/* Address */}
          <ValidatedInput
            label="العنوان"
            name="address"
            value={formData.address || ''}
            onChange={(value) => handleFieldChange('address', value)}
            onBlur={() => handleFieldBlur('address')}
            validationType="arabicText"
            placeholder="شارع النيل"
            required
            error={shouldShowError('address') ? validationErrors['address'] : undefined}
            className="mb-6"
          />

          {/* Governorate */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2">
              المحافظة <span className="text-red-500">*</span>
            </label>
            <select
              name="governorate"
              value={formData.governorate || ''}
              onChange={(e) => handleFieldChange('governorate', e.target.value)}
              onBlur={() => handleFieldBlur('governorate')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                shouldShowError('governorate')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="">اختر المحافظة</option>
              <option value="القاهرة">القاهرة</option>
              <option value="الجيزة">الجيزة</option>
              <option value="القليوبية">القليوبية</option>
              <option value="الإسكندرية">الإسكندرية</option>
              <option value="الشرقية">الشرقية</option>
              <option value="المنوفية">المنوفية</option>
              <option value="الدقهلية">الدقهلية</option>
            </select>
            {shouldShowError('governorate') && (
              <p className="text-red-500 text-sm mt-1">{validationErrors['governorate']}</p>
            )}
          </div>

          {/* Family Income */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2">
              الدخل العائلي الشهري <span className="text-red-500">*</span>
            </label>
            <select
              name="familyIncome"
              value={formData.familyIncome || ''}
              onChange={(e) => handleFieldChange('familyIncome', e.target.value)}
              onBlur={() => handleFieldBlur('familyIncome')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                shouldShowError('familyIncome')
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            >
              <option value="">اختر الدخل العائلي</option>
              <option value="less-than-1000">أقل من 1000 جنيه</option>
              <option value="1000-2000">من 1000 إلى 2000 جنيه</option>
              <option value="2000-3000">من 2000 إلى 3000 جنيه</option>
              <option value="3000-5000">من 3000 إلى 5000 جنيه</option>
              <option value="more-than-5000">أكثر من 5000 جنيه</option>
            </select>
            {shouldShowError('familyIncome') && (
              <p className="text-red-500 text-sm mt-1">{validationErrors['familyIncome']}</p>
            )}
          </div>

          {/* Additional Info */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2">
              معلومات إضافية
            </label>
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo || ''}
              onChange={(e) => handleFieldChange('additionalInfo', e.target.value)}
              placeholder="أي معلومات إضافية تود إضافتها"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid() || isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white text-lg transition-colors ${
              isFormValid() && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </button>

          {/* Form Status Indicator */}
          <div className="mt-4 text-center text-sm text-gray-600">
            {Object.keys(validationErrors).length > 0 && (
              <p>يرجى إصلاح {Object.keys(validationErrors).length} أخطاء</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedApplicationForm;
