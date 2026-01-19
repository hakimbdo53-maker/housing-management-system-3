import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import AlertBox from '@/components/AlertBox';
import { DollarSign, AlertCircle } from 'lucide-react';
import { studentProfileAPI } from '@/services/api';

interface Fee {
  id: string;
  feeType: string;
  amount: number;
  isPaid: boolean;
  dueDate: string;
  paymentDate?: string;
}

/**
 * Fees Page Component
 * 
 * Displays student housing fees and payment status
 */
export default function Fees() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const feesData = await studentProfileAPI.getFees();
      // Ensure feesData is an array
      if (Array.isArray(feesData)) {
        setFees(feesData);
      } else {
        setFees([]);
      }
    } catch (err) {
      console.error('Error fetching fees:', err);
      setError('فشل تحميل بيانات المصروفات. يرجى المحاولة لاحقاً.');
      setFees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalFees = () => {
    if (!Array.isArray(fees)) return 0;
    return fees.reduce((sum, fee) => sum + (fee.amount ?? 0), 0);
  };

  const calculatePaidFees = () => {
    if (!Array.isArray(fees)) return 0;
    return fees
      .filter((fee) => fee.isPaid)
      .reduce((sum, fee) => sum + (fee.amount ?? 0), 0);
  };

  const calculatePendingFees = () => {
    if (!Array.isArray(fees)) return 0;
    return fees
      .filter((fee) => !fee.isPaid)
      .reduce((sum, fee) => sum + (fee.amount ?? 0), 0);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner message="جاري تحميل بيانات المصروفات..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign size={32} className="text-[#0292B3]" />
            <h1 className="text-3xl font-bold text-[#132a4f]">المصروفات</h1>
          </div>
          <p className="text-[#619cba] text-lg">
            عرض مصروفات السكن الجامعي وحالة السداد
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <AlertBox
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Summary Cards */}
        {fees.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-[#0292B3]">
              <p className="text-[#619cba] font-semibold mb-2">إجمالي المصروفات</p>
              <p className="text-[#132a4f] text-3xl font-bold">
                {calculateTotalFees().toFixed(2)} ج.م
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-green-500">
              <p className="text-[#619cba] font-semibold mb-2">المدفوع</p>
              <p className="text-green-600 text-3xl font-bold">
                {calculatePaidFees().toFixed(2)} ج.م
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-red-500">
              <p className="text-[#619cba] font-semibold mb-2">المتبقي</p>
              <p className="text-red-600 text-3xl font-bold">
                {calculatePendingFees().toFixed(2)} ج.م
              </p>
            </div>
          </div>
        )}

        {/* Fees Table/Cards */}
        {fees.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-[#132a4f] mb-6">تفاصيل المصروفات</h2>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#0292B3]">
                    <th className="text-right py-3 px-4 text-[#132a4f] font-bold">
                      نوع الرسوم
                    </th>
                    <th className="text-right py-3 px-4 text-[#132a4f] font-bold">
                      المبلغ
                    </th>
                    <th className="text-right py-3 px-4 text-[#132a4f] font-bold">
                      تاريخ الاستحقاق
                    </th>
                    <th className="text-right py-3 px-4 text-[#132a4f] font-bold">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => (
                    <tr
                      key={fee.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-[#132a4f]">{fee.feeType}</td>
                      <td className="py-3 px-4 text-[#132a4f]">
                        {fee.amount.toFixed(2)} ج.م
                      </td>
                      <td className="py-3 px-4 text-[#619cba]">
                        {new Date(fee.dueDate).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            fee.isPaid
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {fee.isPaid ? 'مدفوع' : 'غير مدفوع'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {fees.map((fee) => (
                <div
                  key={fee.id}
                  className="bg-gray-50 rounded-lg p-4 border-r-4 border-[#0292B3]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-[#132a4f]">{fee.feeType}</h3>
                      <p className="text-[#619cba] text-sm">
                        {new Date(fee.dueDate).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        fee.isPaid
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {fee.isPaid ? 'مدفوع' : 'غير مدفوع'}
                    </span>
                  </div>
                  <p className="text-[#132a4f] text-lg font-bold">
                    {fee.amount.toFixed(2)} ج.م
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <AlertCircle size={48} className="text-[#619cba] mx-auto mb-4 opacity-50" />
            <p className="text-[#619cba] text-lg mb-2">لا توجد مصروفات</p>
            <p className="text-[#619cba] text-sm">
              لم يتم تحديد أي مصروفات للطالب حالياً
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 border-r-4 border-[#0292B3] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#132a4f] mb-2">معلومات مهمة</h3>
          <p className="text-[#619cba]">
            تأكد من سداد المصروفات في الموعد المحدد. في حالة وجود استفسارات بخصوص المصروفات،
            يرجى التواصل مع إدارة المدن الجامعية.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
