import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Info, AlertTriangle, CheckSquare, Clock } from 'lucide-react';
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotificationsList,
  useUnreadNotificationsCount,
} from '../hooks/useNotifications';
import type { AppNotification, NotificationType } from '../types/notification';
const typeConfig: Record<
  NotificationType,
  { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  info: { label: 'Information', badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: Info },
  alerte: { label: 'Alerte', badge: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertTriangle },
  validation_requise: {
    label: 'Action requise',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: CheckSquare,
  },
  rappel: { label: 'Rappel', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Clock },
};
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: unreadCount } = useUnreadNotificationsCount();
  const { data } = useNotificationsList({ page: 1, limit: 10 });
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleClick = (notification: AppNotification) => {
    if (!notification.lu) {
      markAsRead.mutate(notification.id);
    }
    setIsOpen(false);
    if (notification.lien) {
      navigate(notification.lien);
    }
  };
  const hasUnread = Boolean(unreadCount && unreadCount > 0);
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`relative p-2.5 rounded-xl border transition-all cursor-pointer ${
          isOpen
            ? 'bg-blue-50 border-blue-200 text-blue-600'
            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
        }`}
        aria-label="Notifications"
      >
        <Bell className={`w-4.5 h-4.5 ${hasUnread ? 'animate-wiggle' : ''}`} />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold text-white bg-rose-600 rounded-full ring-2 ring-white shadow-xs">
            {unreadCount! > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-84 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/80 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/80 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 brand-title">Notifications</span>
              {hasUnread && (
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {unreadCount} nouvelle{unreadCount! > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {hasUnread && (
              <button
                onClick={() => markAllAsRead.mutate()}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tout marquer lu
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {!data || data.items.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-slate-500">Aucune notification pour le moment.</p>
              </div>
            ) : (
              <ul>
                {data.items.map((notification) => {
                  const type = typeConfig[notification.type] ?? typeConfig.info;
                  const TypeIcon = type.icon;

                  return (
                    <li key={notification.id}>
                      <button
                        onClick={() => handleClick(notification)}
                        className={`w-full text-left p-4 hover:bg-slate-50/80 transition-colors flex items-start gap-3 cursor-pointer ${
                          !notification.lu ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${type.badge}`}
                        >
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${type.badge}`}
                            >
                              {type.label}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {notification.createdAt}
                            </span>
                          </div>
                          <p
                            className={`text-xs ${
                              !notification.lu
                                ? 'font-bold text-slate-900'
                                : 'font-medium text-slate-700'
                            }`}
                          >
                            {notification.titre}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.lu && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
