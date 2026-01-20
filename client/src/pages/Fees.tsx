import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import AlertBox from '@/components/AlertBox';
import FormInput from '@/components/FormInput';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DollarSign, AlertCircle, CreditCard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { studentProfileAPI, studentPaymentsAPI } from '@/services/api';

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionCode, setTransactionCode] = useState('');
  const [receiptPath, setReceiptPath] = useState('');

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

  const handlePaymentClick = (fee: Fee) => {
    setSelectedFee(fee);
    setTransactionCode('');
    setReceiptPath('');
    setPaymentSuccess(false);
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedFee || !transactionCode.trim()) {
      setError('يرجى إدخال رمز المعاملة');
      return;
    }

    try {
      setIsProcessingPayment(true);
      setError(null);

      const feeId = parseInt(selectedFee.id);
      await studentPaymentsAPI.submitPayment(feeId, {
        transactionCode: transactionCode.trim(),
        receiptFilePath: receiptPath,
      });

      setPaymentSuccess(true);
      setTransactionCode('');
      setReceiptPath('');
      
      // Refresh fees after successful payment
      setTimeout(() => {
        setShowPaymentModal(false);
        fetchFees();
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting payment:', err);
      setError(err.message || 'فشل تقديم الدفع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProcessingPayment(false);
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
                    <th className="text-right py-3 px-4 text-[#132a4f] font-bold">
                      الإجراء
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
                      <td className="py-3 px-4">
                        {!fee.isPaid && (
                          <button
                            onClick={() => handlePaymentClick(fee)}
                            className="flex items-center gap-2 px-3 py-1 bg-[#0292B3] hover:bg-[#027A95] text-white text-sm rounded-lg transition-colors"
                          >
                            <CreditCard size={16} />
                            <span>دفع</span>
                          </button>
                        )}
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
                  <div className="flex items-center justify-between">
                    <p className="text-[#132a4f] text-lg font-bold">
                      {fee.amount.toFixed(2)} ج.م
                    </p>
                    {!fee.isPaid && (
                      <button
                        onClick={() => handlePaymentClick(fee)}
                        className="flex items-center gap-2 px-3 py-1 bg-[#0292B3] hover:bg-[#027A95] text-white text-sm rounded-lg transition-colors"
                      >
                        <CreditCard size={16} />
                        <span>دفع</span>
                      </button>
                    )}
                  </div>
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

        {/* Payment Modal */}
        {showPaymentModal && selectedFee && (
          <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>تقديم الدفع</DialogTitle>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={isProcessingPayment}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </DialogHeader>

              <div className="space-y-4">
                {/* Success Message */}
                {paymentSuccess && (
                  <AlertBox type="success" message="تم تقديم الدفع بنجاح! سيتم تحديث الحالة قريباً." />
                )}

                {/* Error Message */}
                {error && !paymentSuccess && (
                  <AlertBox type="error" message={error} />
                )}

                {!paymentSuccess && (
                  <>
                    {/* Fee Details */}
                    <div className="bg-gray-50 rounded-lg p-4 border-r-4 border-[#0292B3]">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[#619cba] text-sm">نوع الرسوم</p>
                          <p className="text-[#132a4f] font-bold">{selectedFee.feeType}</p>
                        </div>
                        <div>
                          <p className="text-[#619cba] text-sm">المبلغ</p>
                          <p className="text-[#132a4f] font-bold">{selectedFee.amount.toFixed(2)} ج.م</p>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Code Input */}
                    <FormInput
                      label="رمز المعاملة"
                      type="text"
                      placeholder="أدخل رمز المعاملة من البنك"
                      value={transactionCode}
                      onChange={(e) => setTransactionCode(e.target.value)}
                      disabled={isProcessingPayment}
                      required
                    />

                    {/* Receipt Path Input (Optional) */}
                    <FormInput
                      label="مسار الإيصال (اختياري)"
                      type="text"
                      placeholder="أدخل مسار الإيصال أو رفع الملف"
                      value={receiptPath}
                      onChange={(e) => setReceiptPath(e.target.value)}
                      disabled={isProcessingPayment}
                    />

                    {/* Instructions */}
                    <div className="bg-yellow-50 border-r-4 border-yellow-500 rounded-lg p-4">
                      <p className="text-yellow-900 text-sm">
                        <strong>تعليمات:</strong> أدخل رمز المعاملة الذي حصلت عليه من البنك بعد إتمام العملية.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleSubmitPayment}
                        disabled={isProcessingPayment || !transactionCode.trim()}
                        className="flex-1 bg-[#0292B3] hover:bg-[#027A95] text-white"
                      >
                        {isProcessingPayment ? 'جاري التقديم...' : 'تقديم الدفع'}
                      </Button>
                      <Button
                        onClick={() => setShowPaymentModal(false)}
                        disabled={isProcessingPayment}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
}
