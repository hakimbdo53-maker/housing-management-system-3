import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Plus } from 'lucide-react';

/**
 * New Application Page Component
 * 
 * Allows students to start a new housing application.
 */
export default function NewApplication() {
  const [, navigate] = useLocation();
  const [selectedType, setSelectedType] = useState<'new' | 'old' | null>(null);

  const applicationTypes = [
    {
      id: 'new',
      title: 'طالب مستجد',
      description: 'للطلاب الجدد الملتحقين بالجامعة للمرة الأولى',
      requirements: [
        'شهادة القيد الجامعي',
        'صورة شخصية حديثة',
        'صورة من الهوية الشخصية',
      ],
    },
    {
      id: 'old',
      title: 'طالب قديم',
      description: 'للطلاب القدامى المستمرين في الدراسة',
      requirements: [
        'شهادة القيد الجامعي',
        'كشف الدرجات الأكاديمي',
        'صورة من الهوية الشخصية',
      ],
    },
  ];

  const handleStartApplication = (type: 'new' | 'old') => {
    // Navigate to the appropriate application form
    if (type === 'new') {
      navigate('/new-student-form');
    } else {
      navigate('/old-student-form');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-4">
            <Plus size={32} className="text-[#0292B3]" />
            <h1 className="text-3xl font-bold text-[#132a4f]">تقديم طلب جديد</h1>
          </div>
          <p className="text-[#619cba] text-lg">
            اختر نوع الطلب المناسب لك
          </p>
        </div>

        {/* Application Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {applicationTypes.map((type) => (
            <div
              key={type.id}
              className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-all"
            >
              <h3 className="text-2xl font-bold text-[#132a4f] mb-3">
                {type.title}
              </h3>
              <p className="text-[#619cba] mb-6">{type.description}</p>

              <div className="mb-6">
                <h4 className="font-semibold text-[#132a4f] mb-3">
                  المتطلبات:
                </h4>
                <ul className="space-y-2">
                  {type.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[#619cba]">
                      <span className="text-[#0292B3] mt-1">✓</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => handleStartApplication(type.id as 'new' | 'old')}
                className="w-full bg-gradient-to-r from-[#0d3a52] to-[#0d5a7a] hover:from-[#0d5a7a] hover:to-[#0d7a9a] text-white font-semibold py-3 rounded-lg transition-all duration-200"
              >
                ابدأ التقديم
              </Button>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border-r-4 border-[#0292B3] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#132a4f] mb-2">ملاحظة مهمة</h3>
          <p className="text-[#619cba] mb-3">
            تأكد من قراءة التعليمات والشروط قبل البدء بالتقديم.
          </p>
          <p className="text-[#619cba]">
            يمكنك حفظ الطلب والعودة إليه لاحقاً قبل انتهاء فترة التقديم.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
