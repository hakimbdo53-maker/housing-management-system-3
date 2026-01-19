import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import FormInput from '@/components/FormInput';
import AlertBox from '@/components/AlertBox';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { trpc } from '@/lib/trpc';

/**
 * Inquiry Page Component
 * 
 * Allows students to search for their application status using their national ID.
 */
export default function Inquiry() {
  const [searchValue, setSearchValue] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchMutation = trpc.applications.searchByNationalId.useMutation({
    onSuccess: (data) => {
      // Safely extract first result
      let firstResult = null;
      if (Array.isArray(data) && data.length > 0) {
        firstResult = data[0];
      } else if (data && typeof data === 'object' && !Array.isArray(data)) {
        firstResult = data;
      }
      
      setResult(firstResult);
      setError(null);
    },
    onError: (error) => {
      setError(error.message || 'فشل البحث. يرجى المحاولة لاحقاً.');
      setResult(null);
    },
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'تم التقديم';
      case 'review':
        return 'قيد المراجعة';
      case 'approved':
        return 'موافق عليه';
      case 'rejected':
        return 'مرفوض';
      default:
        return status;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!searchValue.trim()) {
      setError('يرجى إدخال الرقم القومي');
      return;
    }

    try {
      await searchMutation.mutateAsync({
        nationalId: searchValue.trim(),
      });
    } catch (err) {
      // Error is handled by onError callback
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-4">
            <Search size={32} className="text-[#0292B3]" />
            <h1 className="text-3xl font-bold text-[#132a4f]">الاستفسار عن الطلب</h1>
          </div>
          <p className="text-[#619cba] text-lg">
            ابحث عن حالة طلبك باستخدام الرقم القومي للطالب
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Input - National ID Only */}
            <FormInput
              label="الرقم القومي للطالب"
              placeholder="أدخل الرقم القومي"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              required
            />

            {/* Error Alert */}
            {error && (
              <AlertBox
                type="error"
                message={error}
                onClose={() => setError(null)}
              />
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={searchMutation.isPending}
              className="w-full bg-gradient-to-r from-[#0d3a52] to-[#0d5a7a] hover:from-[#0d5a7a] hover:to-[#0d7a9a] text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {searchMutation.isPending ? 'جاري البحث...' : 'البحث'}
            </Button>
          </form>
        </div>

        {/* Loading State */}
        {searchMutation.isPending && <LoadingSpinner message="جاري البحث عن الطلب..." />}

        {/* Result */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#132a4f]">نتيجة البحث</h2>
              <div
                className={`px-4 py-2 rounded-full font-semibold ${
                  result.status === 'submitted'
                    ? 'bg-blue-100 text-blue-700'
                    : result.status === 'review'
                    ? 'bg-yellow-100 text-yellow-700'
                    : result.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {getStatusLabel(result.status)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[#619cba] text-sm mb-1">اسم الطالب</p>
                <p className="text-[#132a4f] font-semibold text-lg">
                  {result.fullName}
                </p>
              </div>
              <div>
                <p className="text-[#619cba] text-sm mb-1">الرقم القومي</p>
                <p className="text-[#132a4f] font-semibold text-lg">
                  {result.studentId}
                </p>
              </div>
              <div>
                <p className="text-[#619cba] text-sm mb-1">نوع الطالب</p>
                <p className="text-[#132a4f] font-semibold text-lg">
                  {result.studentType === 'new' ? 'طالب مستجد' : 'طالب قديم'}
                </p>
              </div>
              <div>
                <p className="text-[#619cba] text-sm mb-1">التخصص</p>
                <p className="text-[#132a4f] font-semibold text-lg">
                  {result.major}
                </p>
              </div>
              <div>
                <p className="text-[#619cba] text-sm mb-1">تاريخ التقديم</p>
                <p className="text-[#132a4f] font-semibold text-lg">
                  {new Date(result.submittedAt).toLocaleDateString('ar-EG')}
                </p>
              </div>
              <div>
                <p className="text-[#619cba] text-sm mb-1">آخر تحديث</p>
                <p className="text-[#132a4f] font-semibold text-lg">
                  {new Date(result.updatedAt).toLocaleDateString('ar-EG')}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border-r-4 border-[#0292B3] rounded-lg p-4">
              <p className="text-[#619cba] text-sm mb-1">المحافظة</p>
              <p className="text-[#132a4f]">{result.governorate}</p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 border-r-4 border-[#0292B3] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#132a4f] mb-2">معلومات مهمة</h3>
          <p className="text-[#619cba]">
            يتم تحديث حالة الطلب بشكل دوري. إذا لم تجد طلبك، تأكد من إدخال البيانات بشكل صحيح.
            للمزيد من المساعدة، يرجى التواصل مع إدارة المدن الجامعية.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
