import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import FormInput from '@/components/FormInput';
import FormSelect from '@/components/FormSelect';
import FormTextarea from '@/components/FormTextarea';
import AlertBox from '@/components/AlertBox';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { applicationAPI } from '@/services/api';

const newStudentSchema = z.object({
  // National ID: Exactly 14 digits
  nationalID: z
    .string()
    .min(1, 'الرقم القومي مطلوب')
    .regex(/^\d+$/, 'يجب أن يحتوي على أرقام فقط')
    .refine(
      (val) => val.replace(/\D/g, '').length === 14,
      'الرقم القومي يجب أن يكون 14 رقم بالضبط'
    ),

  // Full name: Arabic letters only, no numbers or special characters
  studentName: z
    .string()
    .min(1, 'الاسم الرباعي مطلوب')
    .regex(
      /^[\u0600-\u06FF\s]+$/,
      'يجب أن يكون الاسم باللغة العربية فقط بدون أرقام أو رموز خاصة'
    )
    .refine(
      (val) => val.trim().split(/\s+/).length >= 2,
      'يجب إدخال الاسم الرباعي (اسم أول على الأقل)'
    ),

  // Phone number: Starts with 01 and exactly 11 digits
  mobile: z
    .string()
    .min(1, 'رقم الهاتف مطلوب')
    .regex(/^\d+$/, 'يجب أن يحتوي على أرقام فقط')
    .refine(
      (val) => val.replace(/\D/g, '').length === 11,
      'رقم الهاتف يجب أن يكون 11 رقم بالضبط'
    )
    .refine(
      (val) => val.startsWith('01') || val.startsWith('+201'),
      'رقم الهاتف يجب أن يبدأ بـ 01 أو +201'
    ),

  // Email: Valid email format
  email: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val || val === '') return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      },
      'البريد الإلكتروني غير صحيح'
    ),

  birthDate: z.string().optional(),

  gender: z.string().optional(),

  religion: z.string().optional(),

  governorate: z.string().min(1, 'المحافظة مطلوبة'),

  residenceCity: z.string().optional(),

  address: z.string().min(1, 'العنوان مطلوب'),

  // Guardian relation: Optional
  guardianRelation: z.string().optional(),

  // Father name: Arabic letters only (optional but if provided must be valid)
  fatherName: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        return /^[\u0600-\u06FF\s]+$/.test(val);
      },
      'اسم الأب يجب أن يكون باللغة العربية فقط'
    ),

  // Father national ID: 14 digits (optional but if provided must be valid)
  fatherNationalID: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        const cleaned = val.replace(/\D/g, '');
        return cleaned.length === 14 && /^\d+$/.test(val);
      },
      'الرقم القومي للأب يجب أن يكون 14 رقم'
    ),

  fatherJob: z.string().optional(),

  fatherGovernorate: z.string().optional(),

  fatherResidenceCity: z.string().optional(),

  fatherAddress: z.string().optional(),

  // Guardian name: Arabic letters only (optional but if provided must be valid)
  guardianName: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        return /^[\u0600-\u06FF\s]+$/.test(val);
      },
      'اسم ولي الأمر يجب أن يكون باللغة العربية فقط'
    ),

  // Guardian national ID: 14 digits (optional but if provided must be valid)
  guardianNationalID: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        const cleaned = val.replace(/\D/g, '');
        return cleaned.length === 14 && /^\d+$/.test(val);
      },
      'الرقم القومي لولي الأمر يجب أن يكون 14 رقم'
    ),

  // Guardian phone: 11 digits starting with 01 (optional but if provided must be valid)
  guardianPhone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        const cleaned = val.replace(/\D/g, '');
        return cleaned.length === 11 && (val.startsWith('01') || val.startsWith('+201'));
      },
      'رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 01'
    ),

  guardianGovernorate: z.string().optional(),

  guardianResidenceCity: z.string().optional(),

  guardianAddress: z.string().optional(),

  faculty: z.string().min(1, 'الكلية مطلوبة'),

  department: z
    .string()
    .min(1, 'التخصص مطلوب')
    .regex(
      /^[\u0600-\u06FF\w\s]+$/,
      'التخصص يجب أن يكون بصيغة صحيحة'
    ),

  academicYear: z.string().min(1, 'المستوى الدراسي مطلوب'),

  highschoolType: z.string().optional(),

  highschoolStream: z.string().optional(),

  // GPA: Number between 0 and 100
  highschoolPercentage: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      'النسبة المئوية يجب أن تكون رقم بين 0 و 100'
    ),

  housingType: z.string().optional(),

  needsSpecial: z.string().optional(),

  housingNotes: z.string().optional(),
});

type NewStudentFormData = z.infer<typeof newStudentSchema>;

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

const facultiesList = [
  { value: 'computers_ai', label: 'الحاسبات والذكاء الاصطناعي' },
  { value: 'languages', label: 'الألسن' },
  { value: 'tourism_hotels', label: 'السياحة والفنادق' },
  { value: 'education', label: 'التربية' },
];

export default function NewStudentApplicationForm() {
  const [, navigate] = useLocation();
  const { user } = useAuth(); // Get logged-in user data
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [guardianRelation, setGuardianRelation] = useState<string>('');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('');

  const redSeaCities = [
    { value: 'hurghada', label: 'الغردقة' },
    { value: 'safaga', label: 'سفاجا' },
    { value: 'quseir', label: 'القصير' },
    { value: 'marsa_alam', label: 'مرسى علم' },
    { value: 'ras_gharib', label: 'رأس غارب' },
    { value: 'shalatin', label: 'الشلاتين' },
    { value: 'halayib', label: 'حلايب' },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<NewStudentFormData>({
    resolver: zodResolver(newStudentSchema),
  });

  // Watch governorate value to get its label
  const governorateValue = watch('governorate');

  // Local database mutation for backup
  const localBackupMutation = trpc.student.applications.submit.useMutation();

  // Auto-fill profile data from authenticated user
  useEffect(() => {
    if (user) {
      // Use unified field names from user object
      if ((user as any)?.fullName) {
        setValue('studentName', (user as any).fullName);
      }
      if ((user as any)?.nationalId) {
        setValue('nationalID', (user as any).nationalId);
      }
      if ((user as any)?.phoneNumber) {
        setValue('mobile', (user as any).phoneNumber);
      }
      // Auto-fill email if available
      if ((user as any)?.email) {
        setValue('email', (user as any).email);
      }
    }
  }, [user, setValue]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: NewStudentFormData) => {
    try {
      setGeneralError(null);
      setIsSubmitting(true);
      console.log("[Form] Submitting new student application to external API");
      
      // Get Arabic label for governorate from the list
      const governorateItem = governoratesList.find(item => item.value === data.governorate);
      const governorateLabel = governorateItem?.label || data.governorate;
      
      // Use email from form data or from user or default value
      const userEmail = (user as any)?.email || data.email || '';
      // Ensure email is a valid string (not undefined)
      const finalEmail = userEmail && userEmail.trim() !== '' 
        ? userEmail 
        : 'student@university.edu.eg';
      
      // Clean national ID: remove spaces and non-digit characters
      const cleanedNationalId = data.nationalID.trim().replace(/\D/g, '');
      
      // Submit to external API
      await applicationAPI.submitApplication({
        studentType: 'new',
        fullName: data.studentName,
        studentId: cleanedNationalId,
        nationalId: cleanedNationalId,
        email: finalEmail,
        phone: data.mobile,
        major: data.department,
        gpa: data.highschoolPercentage || 'N/A',
        address: data.address,
        governorate: governorateLabel, // Use Arabic label instead of value
        familyIncome: 'N/A',
        additionalInfo: data.housingNotes,
      });

      // Also save to local database for backup using tRPC
      try {
        await localBackupMutation.mutateAsync({
          studentType: 0, // New student
          studentInfo: {
            fullName: data.studentName,
            studentId: parseInt(cleanedNationalId) || undefined,
            nationalId: cleanedNationalId,
            email: finalEmail,
            phone: data.mobile,
            faculty: data.faculty,
            department: data.department,
            level: data.academicYear,
            address: data.address,
            governorate: data.governorate,
          },
          fatherInfo: {
            fullName: data.fatherName || '',
            nationalId: data.fatherNationalID || '',
            relation: 'أب',
            job: data.fatherOccupation || '',
            phoneNumber: data.fatherPhone || '',
            address: data.fatherAddress || '',
          },
          selectedGuardianRelation: data.guardianRelation || '',
          otherGuardianInfo: {
            fullName: data.guardianName || '',
            nationalId: data.guardianNationalID || '',
            relation: data.guardianRelation || '',
            job: data.guardianOccupation || '',
            phoneNumber: data.guardianPhone || '',
            address: data.guardianAddress || '',
          },
          secondaryInfo: {
            secondaryStream: data.highschoolStream || '',
            totalScore: parseFloat(data.highschoolPercentage || '0'),
            percentage: parseFloat(data.highschoolPercentage || '0'),
            grade: data.highschoolType || '',
          },
          academicInfo: {
            currentGPA: 0,
            lastYearGrade: '',
          },
          governorate: governorateLabel,
          familyIncome: 'N/A',
          additionalInfo: data.housingNotes,
        });
      } catch (localError) {
        console.warn("[Form] Failed to save to local database:", localError);
        // Continue even if local save fails
      }

      setSuccessMessage('تم تقديم طلبك بنجاح!');
      reset();
      setTimeout(() => {
        navigate('/my-applications');
      }, 2000);
    } catch (error: any) {
      setGeneralError(error.message || 'فشل تقديم الطلب. يرجى المحاولة لاحقاً.');
      console.error("[Form] Error submitting application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGovernorateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSelectedGovernorate(selected);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-[#132a4f] mb-2">
            نموذج طلب التقديم للسكن الجامعي للطلاب المستجدين
          </h1>
          <p className="text-[#619cba] text-lg">
            قم بملء البيانات التالية بدقة
          </p>
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* البيانات الشخصية */}
            <div>
              <h3 className="text-xl font-bold text-[#132a4f] mb-4">البيانات الشخصية (بيانات الطالب)</h3>
              <p className="text-sm text-[#619cba] mb-4">
                تم ملء البيانات التالية تلقائيًا من ملفك الشخصي. يمكنك تعديلها إذا لزم الأمر.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput
                  label="الرقم القومي"
                  placeholder="أدخل الرقم القومي أو الإقامة"
                  error={errors.nationalID?.message}
                  required
                  {...register('nationalID')}
                />

                <FormInput
                  label="الاسم رباعي باللغة العربية"
                  placeholder="الاسم رباعي (مثال: محمد أحمد علي حسن)"
                  error={errors.studentName?.message}
                  required
                  {...register('studentName')}
                />

                <FormInput
                  label="رقم الهاتف"
                  type="tel"
                  placeholder="رقم الهاتف"
                  error={errors.mobile?.message}
                  required
                  {...register('mobile')}
                />

                <FormInput
                  label="البريد الإلكتروني"
                  type="email"
                  placeholder="البريد الإلكتروني"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <FormInput
                  label="تاريخ الميلاد"
                  type="date"
                  {...register('birthDate')}
                />

                <FormSelect
                  label="النوع"
                  placeholder="اختر النوع"
                  options={[
                    { value: '', label: 'اختر النوع' },
                    { value: 'ذكر', label: 'ذكر' },
                    { value: 'أنثى', label: 'أنثى' },
                  ]}
                  {...register('gender')}
                />

                <FormSelect
                  label="الديانة"
                  placeholder="اختر الديانة"
                  options={[
                    { value: '', label: 'اختر الديانة' },
                    { value: 'مسلم', label: 'مسلم' },
                    { value: 'مسيحي', label: 'مسيحي' },
                  ]}
                  {...register('religion')}
                />
              </div>
            </div>

            {/* بيانات الإقامة */}
            <div>
              <h3 className="text-xl font-bold text-[#132a4f] mb-4">بيانات الإقامة</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormSelect
                  label="محل الإقامة (المحافظة)"
                  placeholder="اختر المحافظة"
                  options={governoratesList}
                  error={errors.governorate?.message}
                  required
                  {...register('governorate', {
                    onChange: (e) => setSelectedGovernorate(e.target.value),
                  })}
                />

                {selectedGovernorate === 'red_sea' ? (
                  <FormSelect
                    label="المركز / المدينة"
                    placeholder="اختر المدينة"
                    options={redSeaCities}
                    {...register('residenceCity')}
                  />
                ) : (
                  <FormInput
                    label="المركز / المدينة"
                    placeholder="المركز أو المدينة"
                    {...register('residenceCity')}
                  />
                )}

                <FormInput
                  label="العنوان بالتفصيل"
                  placeholder="العنوان بالتفصيل"
                  error={errors.address?.message}
                  required
                  {...register('address')}
                />
              </div>
            </div>

            {/* بيانات ولي الأمر */}
            <div>
              <h3 className="text-xl font-bold text-[#132a4f] mb-4">بيانات ولي الأمر</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormSelect
                  label="صلة ولي الأمر"
                  placeholder="اختر صلة ولي الأمر"
                  options={[
                    { value: '', label: 'اختر صلة ولي الأمر' },
                    { value: 'أب', label: 'أب' },
                    { value: 'أم', label: 'أم' },
                    { value: 'أخ', label: 'أخ' },
                    { value: 'أخت', label: 'أخت' },
                    { value: 'خال', label: 'خال' },
                    { value: 'خالة', label: 'خالة' },
                    { value: 'عم', label: 'عم' },
                    { value: 'عمة', label: 'عمة' },
                    { value: 'جد', label: 'جد' },
                    { value: 'جدة', label: 'جدة' },
                  ]}
                  {...register('guardianRelation')}
                  onChange={(e) => setGuardianRelation(e.currentTarget.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <FormInput
                  label="اسم الأب (الاسم رباعي باللغة العربية)"
                  placeholder="الاسم رباعي (مثل: أحمد محمد علي حسن)"
                  {...register('fatherName')}
                />

                <FormInput
                  label="الرقم القومي للأب"
                  placeholder="الرقم القومي للأب"
                  {...register('fatherNationalID')}
                />

                <FormInput
                  label="وظيفة الأب"
                  placeholder="وظيفة الأب"
                  {...register('fatherJob')}
                />
              </div>

              {/* بيانات إقامة الأب */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <FormSelect
                  label="محافظة إقامة الأب"
                  placeholder="اختر المحافظة"
                  options={governoratesList}
                  {...register('fatherGovernorate')}
                />

                <FormInput
                  label="المركز / مدينة إقامة الأب"
                  placeholder="المركز أو المدينة"
                  {...register('fatherResidenceCity')}
                />

                <FormInput
                  label="عنوان الأب بالتفصيل"
                  placeholder="العنوان بالتفصيل"
                  {...register('fatherAddress')}
                />
              </div>

              {guardianRelation && guardianRelation !== 'أب' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <FormInput
                      label="اسم ولي الأمر (الاسم رباعي باللغة العربية)"
                      placeholder="الاسم رباعي"
                      {...register('guardianName')}
                    />

                    <FormInput
                      label="الرقم القومي لولي الأمر"
                      placeholder="الرقم القومي لولي الأمر"
                      {...register('guardianNationalID')}
                    />

                    <FormInput
                      label="رقم الهاتف لولي الأمر"
                      placeholder="رقم الهاتف"
                      {...register('guardianPhone')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <FormSelect
                      label="محافظة إقامة ولي الأمر"
                      placeholder="اختر المحافظة"
                      options={governoratesList}
                      {...register('guardianGovernorate')}
                    />

                    <FormInput
                      label="المركز / مدينة إقامة ولي الأمر"
                      placeholder="المركز أو المدينة"
                      {...register('guardianResidenceCity')}
                    />

                    <FormInput
                      label="عنوان ولي الأمر بالتفصيل"
                      placeholder="العنوان بالتفصيل"
                      {...register('guardianAddress')}
                    />
                  </div>
                </>
              )}
            </div>

            {/* بيانات الدراسة */}
            <div>
              <h3 className="text-xl font-bold text-[#132a4f] mb-4">بيانات الدراسة</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormSelect
                  label="الكلية"
                  placeholder="اختر الكلية"
                  options={facultiesList}
                  error={errors.faculty?.message}
                  required
                  {...register('faculty')}
                />

                <FormInput
                  label="التخصص"
                  placeholder="أدخل اسم التخصص"
                  error={errors.department?.message}
                  required
                  {...register('department')}
                />

                <FormSelect
                  label="المستوى الدراسي"
                  placeholder="اختر المستوى"
                  options={[
                    { value: '', label: 'اختر المستوى' },
                    { value: 'first', label: 'الأولى' },
                    { value: 'second', label: 'الثانية' },
                    { value: 'third', label: 'الثالثة' },
                    { value: 'fourth', label: 'الرابعة' },
                  ]}
                  error={errors.academicYear?.message}
                  required
                  {...register('academicYear')}
                />
              </div>
            </div>

            {/* بيانات الثانوية العامة */}
            <div>
              <h3 className="text-xl font-bold text-[#132a4f] mb-4">بيانات الثانوية العامة</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormSelect
                  label="نوع الثانوية العامة"
                  options={[
                    { value: 'general', label: 'ثانوية عامة' },
                    { value: 'diploma', label: 'دبلوم' },
                    { value: 'azhari', label: 'أزهري' },
                  ]}
                  {...register('highschoolType')}
                />

                <FormSelect
                  label="شعبة الثانوية العامة"
                  options={[
                    { value: 'science', label: 'علمي علوم' },
                    { value: 'math', label: 'علمي رياضة' },
                    { value: 'literature', label: 'أدبي' },
                  ]}
                  {...register('highschoolStream')}
                />

                <FormInput
                  label="نسبة الثانوية العامة %"
                  type="number"
                  placeholder="النسبة المئوية"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register('highschoolPercentage')}
                />
              </div>
            </div>

            {/* بيانات السكن */}
            <div>
              <h3 className="text-xl font-bold text-[#132a4f] mb-4">بيانات السكن</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormSelect
                  label="نوع السكن"
                  placeholder="اختر نوع السكن"
                  options={[
                    { value: '', label: 'اختر نوع السكن' },
                    { value: 'جديد', label: 'جديد' },
                    { value: 'مستمر', label: 'مستمر' },
                  ]}
                  {...register('housingType')}
                />

                <FormSelect
                  label="ذوي احتياجات خاصة"
                  placeholder="اختر"
                  options={[
                    { value: '', label: 'اختر' },
                    { value: 'نعم', label: 'نعم' },
                    { value: 'لا', label: 'لا' },
                  ]}
                  {...register('needsSpecial')}
                />

                <FormInput
                  label="ملاحظات السكن (اختياري)"
                  placeholder="ملاحظات إضافية عن السكن"
                  {...register('housingNotes')}
                />
              </div>
            </div>

            {/* المستندات */}
            <div>
              <h3 className="text-xl font-bold text-[#132a4f] mb-4">المستندات</h3>
              <FormInput
                type="file"
                label="صورة بطاقة الرقم القومي للطالب"
                accept="image/png, image/jpeg, application/pdf"
                required
              />

              <FormInput
                type="file"
                label="مستندات إضافية"
                accept="image/png, image/jpeg, application/pdf"
                multiple
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-[#0d3a52] to-[#0d5a7a] hover:from-[#0d5a7a] hover:to-[#0d7a9a] text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </Button>

              <Button
                type="button"
                onClick={() => navigate('/new-application')}
                variant="outline"
                className="flex-1 py-3 rounded-lg transition-all duration-200"
              >
                <ArrowRight size={20} className="ml-2" />
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
