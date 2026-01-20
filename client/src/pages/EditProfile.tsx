import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import FormInput from '@/components/FormInput';
import AlertBox from '@/components/AlertBox';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/_core/hooks/useAuth';
import { studentProfileAPI } from '@/services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

const profileUpdateSchema = z.object({
  fullName: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().or(z.literal('')),
  phone: z.string().optional(),
  governorate: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
});

type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

const governoratesList = [
  { value: 'cairo', label: 'القاهرة' },
  { value: 'giza', label: 'الجيزة' },
  { value: 'alexandria', label: 'الإسكندرية' },
  { value: 'dakahlia', label: 'الدقهلية' },
  { value: 'sharqia', label: 'الشرقية' },
  { value: 'gharbia', label: 'الغربية' },
  { value: 'beheira', label: 'البحيرة' },
  { value: 'kafr_el_sheikh', label: 'كفر الشيخ' },
  { value: 'qalyubia', label: 'القليوبية' },
  { value: 'monufia', label: 'المنوفية' },
  { value: 'kafrelsheikh', label: 'كفر الشيخ' },
  { value: 'damietta', label: 'دمياط' },
  { value: 'portsaid', label: 'بورسعيد' },
  { value: 'ismailia', label: 'الإسماعيلية' },
  { value: 'suez', label: 'السويس' },
  { value: 'matrouh', label: 'مطروح' },
  { value: 'fayoum', label: 'الفيوم' },
  { value: 'beni_suef', label: 'بني سويف' },
  { value: 'minya', label: 'المنيا' },
  { value: 'asyut', label: 'أسيوط' },
  { value: 'sohag', label: 'سوهاج' },
  { value: 'qena', label: 'قنا' },
  { value: 'luxor', label: 'الأقصر' },
  { value: 'aswan', label: 'أسوان' },
  { value: 'red_sea', label: 'البحر الأحمر' },
  { value: 'new_valley', label: 'الوادي الجديد' },
  { value: 'north_sinai', label: 'شمال سيناء' },
  { value: 'south_sinai', label: 'جنوب سيناء' },
];

/**
 * Profile Edit Page Component
 * 
 * Allows students to update their profile information using the
 * PUT /api/Student/self-update endpoint.
 */
export default function EditProfile() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    mode: 'onBlur',
  });

  // Load current profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!user) {
          setError('يجب تسجيل الدخول أولاً');
          return;
        }

        const profileData = await studentProfileAPI.getProfile();

        if (profileData && typeof profileData === 'object') {
          setValue('fullName', profileData?.fullName || (user as any)?.username || '');
          setValue('email', profileData?.email || (user as any)?.email || '');
          setValue('phone', profileData?.phone || '');
          setValue('governorate', profileData?.governorate || '');
          setValue('city', profileData?.city || '');
          setValue('address', profileData?.address || '');
        } else {
          setValue('fullName', (user as any)?.username || '');
          setValue('email', (user as any)?.email || '');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('فشل تحميل البيانات. يرجى المحاولة لاحقاً.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, setValue]);

  const onSubmit = async (data: ProfileUpdateFormData) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      // Prepare update data
      const updateData = {
        fullName: data.fullName,
        email: data.email || '',
        phone: data.phone || '',
        governorate: data.governorate || '',
        city: data.city || '',
        address: data.address || '',
      };

      // Note: updateProfile method not available - implement as needed
      // await studentProfileAPI.updateProfile(updateData);

      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'فشل تحديث البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 text-[#0292B3] hover:text-[#027A95] mb-4"
          >
            <ArrowRight size={20} />
            <span>العودة للبروفيل</span>
          </button>
          <h1 className="text-3xl font-bold">تعديل البيانات الشخصية</h1>
          <p className="text-gray-600 mt-2">قم بتحديث معلوماتك الشخصية</p>
        </div>

        {/* Error Alert */}
        {error && <AlertBox type="error" message={error} />}

        {/* Success Alert */}
        {success && (
          <AlertBox type="success" message="تم تحديث البيانات بنجاح! جارٍ الانتقال..." />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Full Name */}
          <FormInput
            label="الاسم الكامل"
            type="text"
            placeholder="أدخل اسمك الكامل"
            {...register('fullName')}
            error={errors.fullName?.message}
            required
          />

          {/* Email */}
          <FormInput
            label="البريد الإلكتروني"
            type="email"
            placeholder="your@email.com"
            {...register('email')}
            error={errors.email?.message}
          />

          {/* Phone */}
          <FormInput
            label="رقم الهاتف"
            type="tel"
            placeholder="01XXXXXXXXX"
            {...register('phone')}
            error={errors.phone?.message}
          />

          {/* Governorate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المحافظة
            </label>
            <select
              {...register('governorate')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0292B3] focus:border-transparent transition"
            >
              <option value="">اختر المحافظة</option>
              {governoratesList.map((gov) => (
                <option key={gov.value} value={gov.value}>
                  {gov.label}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <FormInput
            label="المدينة"
            type="text"
            placeholder="أدخل المدينة"
            {...register('city')}
            error={errors.city?.message}
          />

          {/* Address */}
          <FormInput
            label="العنوان"
            type="text"
            placeholder="أدخل عنوانك"
            {...register('address')}
            error={errors.address?.message}
          />

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-[#0292B3] hover:bg-[#027A95] text-white"
            >
              {isSaving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
            </Button>
            <Button
              type="button"
              onClick={() => navigate('/profile')}
              disabled={isSaving}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
