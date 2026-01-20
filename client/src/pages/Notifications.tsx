import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import AlertBox from '@/components/AlertBox';
import { Button } from '@/components/ui/button';
import { Bell, AlertCircle, CheckCircle } from 'lucide-react';
import { studentProfileAPI } from '@/services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

/**
 * Notifications Page Component
 * 
 * Displays all notifications for the student
 */
export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const notificationsData = await studentProfileAPI.getNotifications();
      // Ensure notificationsData is a valid array
      if (Array.isArray(notificationsData) && notificationsData.length > 0) {
        setNotifications(notificationsData);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('فشل تحميل الإشعارات. يرجى المحاولة لاحقاً.');
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await studentProfileAPI.markNotificationAsRead(notificationId);

      // Update local state - check if notifications is array first
      setNotifications((prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        );
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Ensure notifications is an array
      if (!Array.isArray(notifications)) return;
      
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      await Promise.all(
        unreadNotifications.map((notif) => markAsRead(notif.id))
      );
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const filteredNotifications = (() => {
    if (!Array.isArray(notifications)) return [];
    return notifications.filter((notif) => {
      if (filter === 'unread') {
        return !notif.isRead;
      }
      return true;
    });
  })();

  const unreadCount = (() => {
    if (!Array.isArray(notifications)) return 0;
    return notifications.filter((n) => !n.isRead).length;
  })();

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner message="جاري تحميل الإشعارات..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell size={32} className="text-[#0292B3]" />
              <h1 className="text-3xl font-bold text-[#132a4f]">الإشعارات</h1>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {unreadCount} جديد
              </span>
            )}
          </div>
          <p className="text-[#619cba] text-lg">
            جميع الإشعارات والتحديثات الخاصة بك
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

        {/* Filter and Action Buttons */}
        {notifications.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => setFilter('all')}
                  variant={filter === 'all' ? 'default' : 'outline'}
                  className={`${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-[#0d3a52] to-[#0d5a7a] text-white'
                      : ''
                  }`}
                >
                  جميع الإشعارات ({notifications.length})
                </Button>
                <Button
                  onClick={() => setFilter('unread')}
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  className={`${
                    filter === 'unread'
                      ? 'bg-gradient-to-r from-[#0d3a52] to-[#0d5a7a] text-white'
                      : ''
                  }`}
                >
                  غير المقروءة ({unreadCount})
                </Button>
              </div>
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  className="bg-gradient-to-r from-[#0292B3] to-[#01a8c7] hover:from-[#01a8c7] hover:to-[#00b8d4] text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200"
                >
                  تحديث الكل كمقروء
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg p-6 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                  notification.isRead
                    ? 'bg-white border-r-4 border-gray-300'
                    : 'bg-blue-50 border-r-4 border-[#0292B3] shadow-md'
                }`}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-[#132a4f] text-lg">
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-[#619cba] mb-3 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-[#619cba] text-sm">
                      {new Date(notification.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Status Badge */}
                  {notification.isRead ? (
                    <div className="flex-shrink-0 flex items-center gap-2 ml-4">
                      <CheckCircle size={20} className="text-gray-400" />
                      <span className="text-gray-500 text-sm">مقروء</span>
                    </div>
                  ) : (
                    <div className="flex-shrink-0 flex items-center gap-2 ml-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-500 text-sm font-semibold">جديد</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <AlertCircle size={48} className="text-[#619cba] mx-auto mb-4 opacity-50" />
            <p className="text-[#619cba] text-lg mb-2">
              {filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات'}
            </p>
            <p className="text-[#619cba] text-sm">
              {filter === 'unread'
                ? 'لقد قرأت جميع الإشعارات'
                : 'لن تظهر أي إشعارات حالياً'}
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-blue-50 border-r-4 border-[#0292B3] rounded-lg p-6">
          <h3 className="text-lg font-bold text-[#132a4f] mb-2">معلومات مهمة</h3>
          <p className="text-[#619cba]">
            يتم تحديث الإشعارات بشكل مستمر. تأكد من قراءة جميع الإشعارات المهمة حول طلبك
            والمستجدات المتعلقة بالسكن الجامعي.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
