import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import AlertBox from '@/components/AlertBox';
import FormInput from '@/components/FormInput';
import FormTextarea from '@/components/FormTextarea';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/lib/trpc';

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'resolved' | 'closed';
  createdAt: Date;
  resolvedAt?: Date;
}

const complaintSchema = z.object({
  title: z.string().min(3, 'عنوان الشكوى مطلوب ولا يقل عن 3 أحرف'),
  description: z.string().min(10, 'وصف الشكوى مطلوب ولا يقل عن 10 أحرف'),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

/**
 * Complaints Page Component
 * 
 * Allows students to view and submit complaints
 */
export default function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
  });

  // tRPC queries and mutations
  const complaintsQuery = trpc.complaints.list.useQuery();
  const createComplaintMutation = trpc.complaints.create.useMutation({
    onSuccess: () => {
      complaintsQuery.refetch();
      setSuccessMessage('تم تقديم الشكوى بنجاح. شكراً لتواصلك معنا.');
      reset();
      setShowForm(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error) => {
      setError(error.message || 'فشل تقديم الشكوى. يرجى المحاولة لاحقاً.');
    }
  });

  useEffect(() => {
    if (complaintsQuery.data) {
      setComplaints(complaintsQuery.data as Complaint[]);
    }
  }, [complaintsQuery.data]);

  const onSubmit = async (data: ComplaintFormData) => {
    try {
      setError(null);
      await createComplaintMutation.mutateAsync(data);
    } catch (err) {
      console.error('Error submitting complaint:', err);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد المراجعة';
      case 'resolved':
        return 'تم الرد';
      case 'closed':
        return 'مغلقة';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  if (complaintsQuery.isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner message="جاري تحميل الشكاوى..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={32} className="text-[#0292B3]" />
            <h1 className="text-3xl font-bold text-[#132a4f]">الشكاوى</h1>
          </div>
          <p className="text-[#619cba] text-lg">
            عرض وتقديم الشكاوى والاستفسارات
          </p>
        </div>

        {/* Error and Success Alerts */}
        {error && (
          <AlertBox
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        )}
        {successMessage && (
          <AlertBox
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}

        {/* Submit Complaint Button */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-[#0d3a52] to-[#0d5a7a] hover:from-[#0d5a7a] hover:to-[#0d7a9a] text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={20} />
            تقديم شكوى جديدة
          </Button>
        )}

        {/* Complaint Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-[#132a4f] mb-6">تقديم شكوى جديدة</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormInput
                label="عنوان الشكوى"
                placeholder="أدخل عنوان الشكوى"
                error={errors.title?.message}
                {...register('title')}
              />

              <FormTextarea
                label="وصف الشكوى"
                placeholder="أدخل وصف تفصيلي للشكوى"
                rows={6}
                error={errors.description?.message}
                {...register('description')}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={createComplaintMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-[#0d3a52] to-[#0d5a7a] hover:from-[#0d5a7a] hover:to-[#0d7a9a] text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  {createComplaintMutation.isPending ? 'جاري الإرسال...' : 'تقديم الشكوى'}
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    reset();
                  }}
                  variant="outline"
                  className="flex-1 py-3 rounded-lg transition-all duration-200"
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Complaints List */}
        {complaints.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-[#132a4f] mb-6">قائمة الشكاوى</h2>
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="border-r-4 border-[#0292B3] bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-[#132a4f] mb-1">
                        {complaint.title}
                      </h3>
                      <p className="text-[#619cba] text-sm mb-2">
                        {complaint.description}
                      </p>
                      <p className="text-[#619cba] text-xs">
                        {new Date(complaint.createdAt).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold flex-shrink-0 ml-4 whitespace-nowrap ${getStatusColor(
                        complaint.status
                      )}`}
                    >
                      {getStatusLabel(complaint.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <AlertCircle size={48} className="text-[#619cba] mx-auto mb-4 opacity-50" />
            <p className="text-[#619cba] text-lg mb-2">لا توجد شكاوى حالياً</p>
            <p className="text-[#619cba] text-sm">
              لم تقدم أي شكاوى حتى الآن. يمكنك تقديم شكوى جديدة من الزر أعلاه
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 border-r-4 border-[#0292B3] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#132a4f] mb-2">معلومات مهمة</h3>
          <p className="text-[#619cba]">
            نحن نقدر تعليقاتك واقتراحاتك. سيتم الرد على الشكاوى في أقرب وقت ممكن.
            تأكد من تقديم وصف واضح للمشكلة لتسريع معالجتها.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
