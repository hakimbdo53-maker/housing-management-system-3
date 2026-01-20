import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import FormInput from '@/components/FormInput';
import AlertBox from '@/components/AlertBox';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { applicationAPI } from '@/services/api';

/**
 * Inquiry Page Component
 * 
 * Allows students to search for their application status using their national ID.
 */
export default function Inquiry() {
  const [searchValue, setSearchValue] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Validate national ID (14 digits for Egyptian national ID)
  const isValidNationalId = (id: string): boolean => {
    return /^\d{14}$/.test(id.trim());
  };

  const [isLoading, setIsLoading] = useState(false);
  
  // Get tRPC utils to manually call queries
  const trpcUtils = trpc.useUtils();

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
    setHasSearched(true);

    // Clean the input: remove spaces and non-digit characters
    const cleanedValue = searchValue.trim().replace(/\D/g, '');

    // Validation
    if (!cleanedValue) {
      setError('يرجى إدخال الرقم القومي');
      return;
    }

    if (!isValidNationalId(cleanedValue)) {
      setError('الرقم القومي يجب أن يكون 14 رقم');
      return;
    }

    // Update search value with cleaned version
    setSearchValue(cleanedValue);

    setIsLoading(true);
    try {
      let applications: any[] = [];
      let foundInLocal = false;
      
      // Step 1: Search in local database first (where applications are stored)
      try {
        // Use tRPC utils to manually fetch data
        const localData = await trpcUtils.applications.searchByNationalId.fetch({ 
          nationalId: cleanedValue 
        });
        
        if (localData && Array.isArray(localData) && localData.length > 0) {
          applications = localData;
          foundInLocal = true;
          console.log("[Inquiry] ✅ Found application in local database:", localData.length);
        }
      } catch (localError: any) {
        // Check if it's a "NOT_FOUND" error (expected) or actual error
        if (localError?.data?.code === 'NOT_FOUND' || localError?.data?.httpStatus === 404 || localError?.message?.includes('لم يتم العثور')) {
          console.log("[Inquiry] ℹ️ Application not found in local database, trying external API");
        } else {
          console.error("[Inquiry] ⚠️ Error searching in local database:", localError);
          // Continue to try external API even if there's an error
        }
      }

      // Step 2: If not found locally, search in external API
      if (!foundInLocal) {
        try {
          console.log("[Inquiry] Searching in external API for national ID:", cleanedValue);
          const externalApplications = await applicationAPI.searchByNationalId(cleanedValue);
          
          if (externalApplications && Array.isArray(externalApplications) && externalApplications.length > 0) {
            applications = externalApplications;
            console.log("[Inquiry] Found application in external API:", externalApplications.length);
          } else {
            console.log("[Inquiry] No applications found in external API");
          }
        } catch (externalError: any) {
          console.error("[Inquiry] Error searching in external API:", externalError);
          
          // If it's a "not found" error, show friendly message
          if (externalError?.message?.includes('لم يتم العثور')) {
            // Don't throw, just leave applications empty
          } else {
            // For other errors, check if we can provide helpful feedback
            if (externalError?.message?.includes('ECONNREFUSED') || externalError?.message?.includes('فشل الاتصال')) {
              throw new Error('فشل الاتصال بالخادم، يرجى المحاولة لاحقاً');
            }
            // For other errors, only throw if we didn't find anything locally
            if (!foundInLocal && applications.length === 0) {
              throw externalError;
            }
          }
        }
      }

      // Step 3: Process results
      if (!applications || applications.length === 0) {
        setError('عذرًا، لم يتم العثور على طلب بهذا الرقم القومي');
        setResult(null);
        return;
      }

      // Get the most recent application (latest submittedAt)
      const sorted = [...applications].sort((a, b) => {
        const dateA = new Date(a.submittedAt || a.createdAt || a.date || a.submissionDate || 0).getTime();
        const dateB = new Date(b.submittedAt || b.createdAt || b.date || b.submissionDate || 0).getTime();
        return dateB - dateA;
      });
      
      setResult(sorted[0]);
      setError(null);
    } catch (err: any) {
      console.error("[Inquiry] Error searching:", err);
      
      // Show user-friendly error message based on error type
      let errorMessage = 'فشل الاتصال بالخادم، يرجى المحاولة لاحقاً';
      
      // Check for connection errors first
      if (err?.code === 'ECONNREFUSED' || err?.code === 'ENOTFOUND' || err?.message?.includes('ECONNREFUSED')) {
        errorMessage = 'فشل الاتصال بالخادم، يرجى المحاولة لاحقاً';
      } else if (err?.message?.includes('لم يتم العثور')) {
        errorMessage = 'عذرًا، لم يتم العثور على طلب بهذا الرقم القومي';
      } else if (err?.response?.status === 404) {
        errorMessage = 'عذرًا، لم يتم العثور على طلب بهذا الرقم القومي';
      } else if (err?.response?.status === 401 || err?.response?.status === 403) {
        errorMessage = 'ليس لديك صلاحية للوصول إلى هذه البيانات';
      } else if (err?.response?.status >= 500) {
        errorMessage = 'فشل الاتصال بالخادم، يرجى المحاولة لاحقاً';
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setResult(null);
    } finally {
      setIsLoading(false);
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
            <div>
              <FormInput
                label="الرقم القومي للطالب"
                placeholder="أدخل الرقم القومي (14 رقم)"
                value={searchValue}
                onChange={(e) => {
                  // Only allow digits
                  const value = e.target.value.replace(/\D/g, '');
                  // Limit to 14 digits
                  setSearchValue(value.slice(0, 14));
                }}
                required
                maxLength={14}
              />
              <p className="text-sm text-[#619cba] mt-2">
                أدخل الرقم القومي المصري الخاص بك (14 رقم)
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

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#0d3a52] to-[#0d5a7a] hover:from-[#0d5a7a] hover:to-[#0d7a9a] text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'جاري البحث...' : 'البحث'}
            </Button>
          </form>
        </div>

        {/* Loading State */}
        {isLoading && <LoadingSpinner message="جاري البحث عن الطلب..." />}

        {/* Result */}
        {result && hasSearched && (
          <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#132a4f]">نتيجة البحث</h2>
              <div
                className={`px-4 py-2 rounded-full font-semibold ${
                  result.status === 'submitted' || result.status === 'تم التقديم' || result.status === 'مقدم'
                    ? 'bg-blue-100 text-blue-700'
                    : result.status === 'review' || result.status === 'قيد المراجعة' || result.status === 'مراجعة'
                    ? 'bg-yellow-100 text-yellow-700'
                    : result.status === 'approved' || result.status === 'موافق عليه' || result.status === 'مقبول'
                    ? 'bg-green-100 text-green-700'
                    : result.status === 'rejected' || result.status === 'مرفوض' || result.status === 'مرفض'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {result.status ? getStatusLabel(result.status) : 'غير محدد'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[#619cba] text-sm mb-1">اسم الطالب</p>
                <p className="text-[#132a4f] font-semibold text-lg">
                  {result.fullName || result.studentName || result.name || 'غير متوفر'}
                </p>
              </div>
              <div>
                <p className="text-[#619cba] text-sm mb-1">الرقم القومي</p>
                <p className="text-[#132a4f] font-semibold text-lg">
                  {result.nationalId || result.studentId || result.nationalID || 'غير متوفر'}
                </p>
              </div>
              <div>
                <p className="text-[#619cba] text-sm mb-1">نوع الطالب</p>
                <p className="text-[#132a4f] font-semibold text-lg">
                  {result.studentType === 'new' || result.studentType === 'جديد' 
                    ? 'طالب مستجد' 
                    : result.studentType === 'old' || result.studentType === 'قديم'
                    ? 'طالب قديم'
                    : result.studentType || 'غير محدد'}
                </p>
              </div>
              <div>
                <p className="text-[#619cba] text-sm mb-1">التخصص</p>
                <p className="text-[#132a4f] font-semibold text-lg">
                  {result.major || result.department || result.specialization || 'غير متوفر'}
                </p>
              </div>
              <div>
                <p className="text-[#619cba] text-sm mb-1">تاريخ التقديم</p>
                <p className="text-[#132a4f] font-semibold text-lg">
                  {result.submittedAt || result.createdAt || result.date || result.submissionDate 
                    ? new Date(result.submittedAt || result.createdAt || result.date || result.submissionDate).toLocaleDateString('ar-EG')
                    : 'غير متوفر'}
                </p>
              </div>
              <div>
                <p className="text-[#619cba] text-sm mb-1">آخر تحديث</p>
                <p className="text-[#132a4f] font-semibold text-lg">
                  {result.updatedAt || result.modifiedAt || result.lastUpdate
                    ? new Date(result.updatedAt || result.modifiedAt || result.lastUpdate).toLocaleDateString('ar-EG')
                    : 'غير متوفر'}
                </p>
              </div>
            </div>

            {result.governorate && (
              <div className="bg-blue-50 border-r-4 border-[#0292B3] rounded-lg p-4">
                <p className="text-[#619cba] text-sm mb-1">المحافظة</p>
                <p className="text-[#132a4f]">{result.governorate}</p>
              </div>
            )}
            
            {/* Additional Info if available */}
            {(result.address || result.email || result.phone) && (
              <div className="bg-gray-50 border-r-4 border-gray-400 rounded-lg p-4 space-y-2">
                {result.address && (
                  <div>
                    <p className="text-[#619cba] text-sm mb-1">العنوان</p>
                    <p className="text-[#132a4f]">{result.address}</p>
                  </div>
                )}
                {result.email && (
                  <div>
                    <p className="text-[#619cba] text-sm mb-1">البريد الإلكتروني</p>
                    <p className="text-[#132a4f]">{result.email}</p>
                  </div>
                )}
                {result.phone && (
                  <div>
                    <p className="text-[#619cba] text-sm mb-1">رقم الهاتف</p>
                    <p className="text-[#132a4f]">{result.phone}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* No Results Message */}
        {hasSearched && !result && !isLoading && !error && (
          <div className="bg-yellow-50 border-r-4 border-yellow-500 rounded-lg p-6">
            <p className="text-yellow-700">
              لم يتم العثور على طلب بهذا الرقم القومي. تأكد من إدخال الرقم بشكل صحيح.
            </p>
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
