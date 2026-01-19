import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import FormInput from '@/components/FormInput';
import FormSelect from '@/components/FormSelect';
import FormTextarea from '@/components/FormTextarea';
import AlertBox from '@/components/AlertBox';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, FileText } from 'lucide-react';

// Validation schema
const applicationSchema = z.object({
  fullName: z.string().min(3, 'الاسم مطلوب'),
  studentId: z.string().min(1, 'الرقم الجامعي مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  major: z.string().min(1, 'التخصص مطلوب'),
  gpa: z.string().min(1, 'المعدل التراكمي مطلوب'),
  address: z.string().min(10, 'العنوان مطلوب'),
  governorate: z.string().min(1, 'المحافظة مطلوبة'),
  familyIncome: z.string().min(1, 'الدخل العائلي مطلوب'),
  additionalInfo: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  studentType: 'new' | 'old';
}

export default function ApplicationForm() {
  const [, navigate] = useLocation();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get studentType from URL params
  const studentType = (typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.pathname.split('/').pop()).get('type') as 'new' | 'old'
    : null) || 'new';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const submitMutation = trpc.applications.create.useMutation({
    onSuccess: (data) => {
      setSuccessMessage('تم تقديم طلبك بنجاح!');
      reset();
      setTimeout(() => {
        navigate('/my-applications');
      }, 2000);
    },
    onError: (error) => {
      setGeneralError(error.message);
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      setGeneralError(null);
      await submitMutation.mutateAsync({
        studentType,
        ...data,
      });
    } catch (error) {
      // Error is handled by onError
    }
  };

  const pageTitle = studentType === 'new' 
    ? 'نموذج تقديم طلب - طالب مستجد'
    : 'نموذج تقديم طلب - طالب قديم';

  const pageDescription = studentType === 'new'
    ? 'قم بملء البيانات التالية لتقديم طلب السكن الجامعي'
    : 'قم بملء البيانات التالية لتقديم طلب السكن الجامعي';

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText size={32} className="text-[#0292B3]" />
            <h1 className="text-3xl font-bold text-[#132a4f]">{pageTitle}</h1>
          </div>
          <p className="text-[#619cba] text-lg">{pageDescription}</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6">
            <AlertBox
              type="success"
              title="نجح التقديم"
              message={successMessage}
              onClose={() => setSuccessMessage(null)}
            />
          </div>
        )}

        {/* Error Message */}
        {generalError && (
          <div className="mb-6">
            <AlertBox
              type="error"
              title="خطأ في التقديم"
              message={generalError}
              onClose={() => setGeneralError(null)}
            />
          </div>
        )}

        {/* Application Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-xl font-bold text-[#132a4f] mb-4">البيانات الشخصية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="الاسم الكامل"
                  placeholder="أدخل اسمك الكامل"
                  error={errors.fullName?.message}
                  required
                  {...register('fullName')}
                />

                <FormInput
                  label="الرقم الجامعي"
                  placeholder="أدخل الرقم الجامعي"
                  error={errors.studentId?.message}
                  required
                  {...register('studentId')}
                />

                <FormInput
                  label="البريد الإلكتروني"
                  type="email"
                  placeholder="your.email@university.edu"
                  error={errors.email?.message}
                  required
                  {...register('email')}
                />

                <FormInput
                  label="رقم الهاتف"
                  placeholder="+20 1234567890"
                  error={errors.phone?.message}
                  required
                  {...register('phone')}
                />
              </div>
            </div>

            {/* Academic Information Section */}
            <div>
              <h3 className="text-xl font-bold text-[#132a4f] mb-4">البيانات الأكاديمية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSelect
                  label="التخصص"
                  placeholder="اختر التخصص"
                  options={[
                    { value: 'engineering', label: 'الهندسة' },
                    { value: 'medicine', label: 'الطب' },
                    { value: 'science', label: 'العلوم' },
                    { value: 'arts', label: 'الآداب' },
                    { value: 'commerce', label: 'التجارة' },
                    { value: 'law', label: 'القانون' },
                    { value: 'other', label: 'أخرى' },
                  ]}
                  error={errors.major?.message}
                  required
                  {...register('major')}
                />

                <FormSelect
                  label="المعدل التراكمي"
                  placeholder="اختر المعدل"
                  options={[
                    { value: 'below2', label: 'أقل من 2.0' },
                    { value: '2-2.5', label: '2.0 - 2.5' },
                    { value: '2.5-3', label: '2.5 - 3.0' },
                    { value: '3-3.5', label: '3.0 - 3.5' },
                    { value: 'above3.5', label: '3.5 أو أعلى' },
                  ]}
                  error={errors.gpa?.message}
                  required
                  {...register('gpa')}
                />
              </div>
            </div>

            {/* Residential Information Section */}
            <div>
              <h3 className="text-xl font-bold text-[#132a4f] mb-4">بيانات السكن</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormTextarea
                  label="العنوان الحالي"
                  placeholder="أدخل عنوان السكن الحالي"
                  error={errors.address?.message}
                  required
                  {...register('address')}
                />

                <FormSelect
                  label="المحافظة"
                  placeholder="اختر المحافظة"
                  options={[
                    { value: 'cairo', label: 'القاهرة' },
                    { value: 'giza', label: 'الجيزة' },
                    { value: 'alexadria', label: 'الإسكندرية' },
                    { value: 'hurghada', label: 'الغردقة' },
                    { value: 'aswan', label: 'أسوان' },
                    { value: 'luxor', label: 'الأقصر' },
                    { value: 'other', label: 'أخرى' },
                  ]}
                  error={errors.governorate?.message}
                  required
                  {...register('governorate')}
                />
              </div>
            </div>

            {/* Financial Information Section */}
            <div>
              <h3 className="text-xl font-bold text-[#132a4f] mb-4">البيانات المالية</h3>
              <FormSelect
                label="الدخل العائلي"
                placeholder="اختر نطاق الدخل العائلي"
                options={[
                  { value: 'below5000', label: 'أقل من 5000 جنيه' },
                  { value: '5000-10000', label: '5000 - 10000 جنيه' },
                  { value: '10000-15000', label: '10000 - 15000 جنيه' },
                  { value: '15000-20000', label: '15000 - 20000 جنيه' },
                  { value: 'above20000', label: '20000 جنيه فأكثر' },
                ]}
                error={errors.familyIncome?.message}
                required
                {...register('familyIncome')}
              />
            </div>

            {/* Additional Information Section */}
            <div>
              <h3 className="text-xl font-bold text-[#132a4f] mb-4">معلومات إضافية</h3>
              <FormTextarea
                label="ملاحظات إضافية (اختياري)"
                placeholder="أضف أي معلومات إضافية تراها مهمة"
                error={errors.additionalInfo?.message}
                {...register('additionalInfo')}
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="flex-1 bg-gradient-to-r from-[#0d3a52] to-[#0d5a7a] hover:from-[#0d5a7a] hover:to-[#0d7a9a] text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {submitMutation.isPending ? 'جاري التقديم...' : 'تقديم الطلب'}
              </Button>

              <Button
                type="button"
                onClick={() => navigate('/new-application')}
                variant="outline"
                className="flex-1 py-3 rounded-lg transition-all duration-200"
              >
                <ArrowRight size={20} className="ml-2" />
                العودة
              </Button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border-r-4 border-[#0292B3] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#132a4f] mb-2">ملاحظة مهمة</h3>
          <p className="text-[#619cba] mb-3">
            تأكد من صحة جميع البيانات قبل التقديم.
          </p>
          <p className="text-[#619cba]">
            لا يمكن تعديل البيانات بعد التقديم، لذلك تأكد من جميع المعلومات.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
