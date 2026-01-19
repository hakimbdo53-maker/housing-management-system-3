import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import AlertBox from '@/components/AlertBox';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Users, CheckCircle } from 'lucide-react';
import { studentProfileAPI } from '@/services/api';

interface Assignment {
  id: string;
  roomNumber: string;
  buildingName: string;
  floor: number;
  bed: string;
  assignedDate: string;
  status: 'assigned' | 'pending' | 'completed';
}

/**
 * Room Assignments Page Component
 * 
 * Displays student's room assignments and housing allocation
 */
export default function RoomAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const assignmentsData = await studentProfileAPI.getAssignments();
      // Ensure assignmentsData is an array
      if (Array.isArray(assignmentsData)) {
        setAssignments(assignmentsData);
      } else {
        setAssignments([]);
        setError('لم يتم العثور على أي تخصيصات.');
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('فشل تحميل التخصيصات. يرجى المحاولة لاحقاً.');
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'مخصص';
      case 'pending':
        return 'قيد الانتظار';
      case 'completed':
        return 'مكتمل';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner message="جاري تحميل التخصيصات..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-4">
            <Building2 size={32} className="text-[#0292B3]" />
            <h1 className="text-3xl font-bold text-[#132a4f]">تخصيص الغرف</h1>
          </div>
          <p className="text-[#619cba] text-lg">
            عرض التخصيصات السكنية والعنوان المسجل
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

        {/* Empty State */}
        {assignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Building2 size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-[#132a4f] mb-2">لا توجد تخصيصات</h3>
            <p className="text-[#619cba]">
              لم يتم تخصيص أي غرفة حالياً. يرجى التحقق لاحقاً.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {/* Building Info */}
                  <div className="flex items-start gap-3">
                    <Building2 size={24} className="text-[#0292B3] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-[#619cba] font-semibold mb-1">المبنى</p>
                      <p className="text-[#132a4f] text-lg font-bold">
                        {(assignment as any)?.buildingName || 'بيانات غير متوفرة'}
                      </p>
                    </div>
                  </div>

                  {/* Room Number */}
                  <div className="flex items-start gap-3">
                    <MapPin size={24} className="text-[#0292B3] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-[#619cba] font-semibold mb-1">رقم الغرفة</p>
                      <p className="text-[#132a4f] text-lg font-bold">
                        {(assignment as any)?.roomNumber || 'غير محدد'}
                      </p>
                    </div>
                  </div>

                  {/* Floor */}
                  <div className="flex items-start gap-3">
                    <Users size={24} className="text-[#0292B3] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-[#619cba] font-semibold mb-1">الدور</p>
                      <p className="text-[#132a4f] text-lg font-bold">
                        {(assignment as any)?.floor || 'غير محدد'}
                      </p>
                    </div>
                  </div>

                  {/* Bed */}
                  <div className="flex items-start gap-3">
                    <CheckCircle size={24} className="text-[#0292B3] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-[#619cba] font-semibold mb-1">السرير</p>
                      <p className="text-[#132a4f] text-lg font-bold">
                        {(assignment as any)?.bed || 'غير محدد'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status and Date */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t">
                  <div className="mb-4 md:mb-0">
                    <p className="text-[#619cba] text-sm mb-1">تاريخ التخصيص</p>
                    <p className="text-[#132a4f] font-semibold">
                      {(assignment as any)?.assignedDate
                        ? new Date((assignment as any).assignedDate).toLocaleDateString('ar-EG')
                        : 'غير متوفر'}
                    </p>
                  </div>

                  <div
                    className={`px-4 py-2 rounded-full font-semibold text-sm inline-block md:inline-block ${getStatusColor(
                      (assignment as any)?.status || 'pending'
                    )}`}
                  >
                    {getStatusLabel((assignment as any)?.status || 'pending')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-center">
          <Button
            onClick={fetchAssignments}
            className="bg-gradient-to-r from-[#0d3a52] to-[#0d5a7a] hover:from-[#0d5a7a] hover:to-[#0d7a9a] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
          >
            تحديث
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
