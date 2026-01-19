import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { User, Lock, IdCard } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import FormInput from '@/components/FormInput';
import AlertBox from '@/components/AlertBox';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

// Validation schema - Unified field names
const signupSchema = z.object({
  username: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
  studentId: z.string().min(1, 'الرقم الجامعي مطلوب'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  // Unified Profile Data (stored in Backend)
  fullName: z.string().min(3, 'الاسم الكامل مطلوب'),
  nationalId: z.string().min(1, 'الرقم القومي مطلوب'),
  phoneNumber: z.string().min(10, 'رقم الهاتف مطلوب'),
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const signupMutation = trpc.auth.signup.useMutation({
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
        username: data.username,
        studentId: data.studentId,
        password: data.password,
        // Unified Profile Data
        fullName: data.fullName,
        nationalId: data.nationalId,
        phoneNumber: data.phoneNumber,
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
          icon={<IdCard size={20} />}
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
        <FormInput
          label="الرقم القومي"
          placeholder="أدخل الرقم القومي أو رقم الإقامة"
          error={errors.nationalId?.message}
          required
          {...register('nationalId')}
        />

        {/* Phone Number Field - Unified Profile Data */}
        <FormInput
          label="رقم الهاتف"
          type="tel"
          placeholder="أدخل رقم الهاتف"
          error={errors.phoneNumber?.message}
          required
          {...register('phoneNumber')}
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
