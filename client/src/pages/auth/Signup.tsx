import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { User, Lock, CreditCard } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import FormInput from '@/components/FormInput';
import ValidatedInput from '@/components/ValidatedInput';
import AlertBox from '@/components/AlertBox';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { validatePhone, validateNId } from '@shared/validation';

// Validation schema - Unified field names
const signupSchema = z.object({
  username: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
  studentId: z.string().min(1, 'الرقم الجامعي مطلوب'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  // Unified Profile Data (stored in Backend)
  fullName: z.string().min(3, 'الاسم الكامل مطلوب'),
  nationalId: z.string()
    .min(1, 'الرقم القومي مطلوب')
    .regex(/^[0-9]{14}$/, 'الرقم القومي يجب أن يكون 14 رقم بالضبط'),
  phoneNumber: z.string()
    .min(1, 'رقم الهاتف مطلوب')
    .regex(/^01[0-9]{9}$/, 'رقم الهاتف يجب أن يكون 11 رقم يبدأ بـ 01'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

/**
 * Signup Page Component
 * 
 * Student registration page with form validation and API integration.
 */
export default function Signup() {
  const [, navigate] = useLocation();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [nationalIdError, setNationalIdError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const signupMutation = trpc.student.auth.register.useMutation({
    onSuccess: () => {
      // Data already saved in onSubmit before API call
      navigate('/login');
    },
    onError: (error) => {
      setGeneralError(error.message);
    }
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setGeneralError(null);
      
      // Send unified profile data to Backend
      // Backend stores in User table
      await signupMutation.mutateAsync({
        userName: data.username,
        password: data.password,
        role: "student",
        studentId: parseInt(data.studentId) || undefined,
        email: data.email,
      });
    } catch (error) {
      // Error is handled by onError
    }
  };

  return (
    <AuthLayout
      title="إنشاء حساب جديد"
      subtitle="سجل بياناتك للانضمام إلى منصة المدن الجامعية"
    >
      {/* General Error */}
      {generalError && (
        <div className="mb-6">
          <AlertBox
            type="error"
            title="خطأ في إنشاء الحساب"
            message={generalError}
            onClose={() => setGeneralError(null)}
          />
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 max-h-[70vh] overflow-y-auto">
        {/* Username Field */}
        <FormInput
          label="اسم المستخدم"
          placeholder="أدخل اسم المستخدم"
          icon={<User size={20} />}
          error={errors.username?.message}
          required
          {...register('username')}
        />

        {/* Student ID Field */}
        <FormInput
          label="الرقم الجامعي (Student ID)"
          type="number"
          placeholder="أدخل الرقم الجامعي"
          icon={<CreditCard size={20} />}
          error={errors.studentId?.message}
          required
          {...register('studentId')}
        />

        {/* Full Name Field - Unified Profile Data */}
        <FormInput
          label="الاسم الكامل"
          placeholder="أدخل اسمك الكامل"
          icon={<User size={20} />}
          error={errors.fullName?.message}
          required
          {...register('fullName')}
        />

        {/* National ID Field - Unified Profile Data */}
        <ValidatedInput
          label="الرقم القومي"
          name="nationalId"
          placeholder="14 رقم - مثال: 30303030303030"
          validationType="nationalId"
          maxLength={14}
          error={nationalIdError || errors.nationalId?.message}
          onBlur={() => {
            const value = register('nationalId').name;
            // Will be validated by react-hook-form
          }}
          onChange={(value) => {
            setValue('nationalId', value);
            const validation = validateNId(value);
            setNationalIdError(validation.isValid ? '' : validation.message);
          }}
          required
        />

        {/* Phone Number Field - Unified Profile Data */}
        <ValidatedInput
          label="رقم الهاتف"
          name="phoneNumber"
          placeholder="11 رقم - مثال: 01000000000"
          validationType="phone"
          maxLength={11}
          error={phoneError || errors.phoneNumber?.message}
          onBlur={() => {
            // Will be validated by react-hook-form
          }}
          onChange={(value) => {
            setValue('phoneNumber', value);
            const validation = validatePhone(value);
            setPhoneError(validation.isValid ? '' : validation.message);
          }}
          required
        />

        {/* Email Field - Unified Profile Data */}
        <FormInput
          label="البريد الإلكتروني"
          type="email"
          placeholder="أدخل البريد الإلكتروني"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        {/* Password Field */}
        <FormInput
          label="كلمة المرور"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={20} />}
          error={errors.password?.message}
          required
          showPasswordToggle
          {...register('password')}
        />

        {/* Confirm Password Field */}
        <FormInput
          label="تأكيد كلمة المرور"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={20} />}
          error={errors.confirmPassword?.message}
          required
          showPasswordToggle
          {...register('confirmPassword')}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={signupMutation.isPending}
          className="w-full mt-6 bg-gradient-to-r from-[#0d3a52] to-[#0d5a7a] hover:from-[#0d5a7a] hover:to-[#0d7a9a] text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          {signupMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء حساب'}
        </Button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-[#619cba] text-sm">
          لديك حساب بالفعل؟{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#0d5a7a] font-semibold hover:underline transition-colors"
          >
            تسجيل الدخول
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
