import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import AlertBox from '@/components/AlertBox';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { User, Bell, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

/**
 * Profile Page Component
 * 
 * Displays student profile information from authenticated user
 * Uses unified field names: fullName, nationalId, phoneNumber, email
 */
export default function Profile() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      setError('لم تقم بتسجيل الدخول. سيتم تحويلك إلى صفحة تسجيل الدخول.');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <MainLayout>
        <LoadingSpinner message="جاري التحقق من بيانات المستخدم..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-4">
            <User size={32} className="text-[#0292B3]" />
            <h1 className="text-3xl font-bold text-[#132a4f]">الملف الشخصي</h1>
          </div>
          <p className="text-[#619cba] text-lg">
            معلومات الحساب والبيانات الشخصية
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

        {/* Profile Information - Using Unified Field Names */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-[#132a4f] mb-6">بيانات الطالب</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <p className="text-[#619cba] font-semibold mb-2">الاسم الكامل</p>
              <p className="text-[#132a4f] text-lg">
                {(user as any)?.fullName || '-'}
              </p>
            </div>

            {/* National ID */}
            <div>
              <p className="text-[#619cba] font-semibold mb-2">الرقم القومي</p>
              <p className="text-[#132a4f] text-lg">
                {(user as any)?.nationalId || '-'}
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <p className="text-[#619cba] font-semibold mb-2">رقم الهاتف</p>
              <p className="text-[#132a4f] text-lg">
                {(user as any)?.phoneNumber || '-'}
              </p>
            </div>

            {/* Email */}
            <div>
              <p className="text-[#619cba] font-semibold mb-2">البريد الإلكتروني</p>
              <p className="text-[#132a4f] text-lg">
                {(user as any)?.email || '-'}
              </p>
            </div>

            {/* Student ID */}
            <div>
              <p className="text-[#619cba] font-semibold mb-2">رقم الطالب</p>
              <p className="text-[#132a4f] text-lg">
                {(user as any)?.studentId || '-'}
              </p>
            </div>

            {/* Username */}
            <div>
              <p className="text-[#619cba] font-semibold mb-2">اسم المستخدم</p>
              <p className="text-[#132a4f] text-lg">
                {(user as any)?.username || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Notifications Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bell size={24} className="text-[#0292B3]" />
              <h2 className="text-2xl font-bold text-[#132a4f]">آخر الإشعارات</h2>
            </div>
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border-r-4 border-[#0292B3] bg-blue-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-[#132a4f] mb-2">
                        {notification.title}
                      </h3>
                      <p className="text-[#619cba] text-sm mb-2">
                        {notification.message}
                      </p>
                      <p className="text-[#619cba] text-xs">
                        {new Date(notification.createdAt).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="ml-4 w-3 h-3 bg-[#0292B3] rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))}

              <Button
                onClick={() => navigate('/notifications')}
                className="w-full mt-4 bg-gradient-to-r from-[#0d3a52] to-[#0d5a7a] hover:from-[#0d5a7a] hover:to-[#0d7a9a] text-white font-semibold py-3 rounded-lg transition-all duration-200"
              >
                عرض كل الإشعارات
              </Button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <AlertCircle size={48} className="text-[#619cba] mx-auto mb-4 opacity-50" />
              <p className="text-[#619cba] text-lg mb-2">لا توجد إشعارات حالياً</p>
              <p className="text-[#619cba] text-sm">
                ستظهر الإشعارات هنا عند وجود تحديثات جديدة
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/fees')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 text-right"
          >
            <div className="bg-yellow-100 text-yellow-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#132a4f] mb-2">المصروفات</h3>
            <p className="text-[#619cba] text-sm">عرض مصروفات السكن</p>
          </button>

          <button
            onClick={() => navigate('/complaints')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 text-right"
          >
            <div className="bg-red-100 text-red-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#132a4f] mb-2">الشكاوى</h3>
            <p className="text-[#619cba] text-sm">تقديم أو عرض الشكاوى</p>
          </button>

          <button
            onClick={() => navigate('/notifications')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 text-right"
          >
            <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Bell size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#132a4f] mb-2">الإشعارات</h3>
            <p className="text-[#619cba] text-sm">عرض جميع الإشعارات</p>
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
