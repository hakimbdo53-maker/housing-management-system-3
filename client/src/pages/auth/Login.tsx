import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { User, Lock } from 'lucide-react';
import AuthLayout from '@/components/AuthLayout';
import FormInput from '@/components/FormInput';
import AlertBox from '@/components/AlertBox';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

// Validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Login Page Component
 * 
 * Student login page with form validation and API integration.
 */
export default function Login() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const utils = trpc.useUtils();
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      // Update the cached user data immediately
      utils.auth.me.setData(undefined, data.user as any);
      // Wait a tick to ensure React state is updated
      await new Promise(resolve => setTimeout(resolve, 0));
      // Then navigate
      navigate('/');
    },
    onError: (error) => {
      setGeneralError(error.message);
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setGeneralError(null);
      await loginMutation.mutateAsync({
        username: data.username,
        password: data.password,
      });
    } catch (error) {
      // Error is handled by onError
    }
  };

  return (
    <AuthLayout
      title="مرحباً بعودتك"
      subtitle="سجل دخولك للوصول إلى حسابك والاستمتاع بخدماتنا"
    >
      {/* General Error */}
      {generalError && (
        <div className="mb-6">
          <AlertBox
            type="error"
            title="خطأ في تسجيل الدخول"
            message={generalError}
            onClose={() => setGeneralError(null)}
          />
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        {/* Username Field */}
        <FormInput
          label="اسم المستخدم"
          placeholder="أدخل اسم المستخدم"
          icon={<User size={20} />}
          error={errors.username?.message}
          required
          {...register('username')}
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
          onPasswordToggle={setShowPassword}
          {...register('password')}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full mt-6 bg-gradient-to-r from-[#0d3a52] to-[#0d5a7a] hover:from-[#0d5a7a] hover:to-[#0d7a9a] text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          {loginMutation.isPending ? 'جاري التحميل...' : 'تسجيل الدخول'}
        </Button>
      </form>

      {/* Signup Link */}
      <div className="mt-6 text-center">
        <p className="text-[#619cba] text-sm">
          ليس لديك حساب؟{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-[#0d5a7a] font-semibold hover:underline transition-colors"
          >
            إنشاء حساب جديد
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
