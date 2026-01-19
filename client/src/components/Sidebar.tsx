import React from 'react';
import { X, Home, FileText, Calendar, HelpCircle, Search, User, DollarSign, AlertCircle, Bell } from 'lucide-react';
import { useLocation } from 'wouter';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sidebar Component
 * 
 * Navigation sidebar for authenticated pages.
 * Shows main navigation menu items including student profile, fees, complaints, and notifications.
 */
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location, navigate] = useLocation();

  const menuItems = [
    { label: 'الرئيسية', icon: Home, href: '/dashboard', id: 'dashboard' },
    { label: 'الملف الشخصي', icon: User, href: '/profile', id: 'profile' },
    { label: 'تقديم طلب جديد', icon: FileText, href: '/new-application', id: 'new-app' },
    { label: 'تطبيقاتي', icon: FileText, href: '/my-applications', id: 'my-apps' },
    { label: 'الاستفسار عن الطلب', icon: Search, href: '/inquiry', id: 'inquiry' },
    { label: 'المصروفات', icon: DollarSign, href: '/fees', id: 'fees' },
    { label: 'الشكاوى', icon: AlertCircle, href: '/complaints', id: 'complaints' },
    { label: 'الإشعارات', icon: Bell, href: '/notifications', id: 'notifications' },
    { label: 'التواريخ المهمة', icon: Calendar, href: '/dates', id: 'dates' },
    { label: 'التعليمات', icon: HelpCircle, href: '/instructions', id: 'instructions' },
  ];

  const isActive = (href: string) => location === href;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 right-0 h-screen w-64 bg-gradient-to-b from-[#0d1f2d] to-[#0d3a52] text-white transform transition-transform duration-300 z-50 lg:z-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Close Button (Mobile Only) */}
        <div className="lg:hidden p-4 flex justify-between items-center border-b border-white/10">
          <h2 className="font-bold">القائمة</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.href);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-[#0292B3] text-white shadow-lg'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 text-xs text-white/60">
          <p>جامعة الغردقة</p>
          <p>إدارة المدن الجامعية</p>
        </div>
      </aside>
    </>
  );
}
