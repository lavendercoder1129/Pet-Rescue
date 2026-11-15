import { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const NotificationDropdown = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifs = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const data = await getNotifications();
      if (data && data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // Non-intrusive polling failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifs();
      // Polling interval every 30 seconds
      const timer = setInterval(fetchNotifs, 30000);
      return () => clearInterval(timer);
    }
  }, [isAuthenticated]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-charcoal-muted hover:text-forest hover:bg-forest/5 transition-colors focus:outline-none focus:ring-2 focus:ring-forest/20"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-terracotta rounded-full shadow-warm-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-warm border border-grey-light z-50 overflow-hidden font-sans">
          {/* Header */}
          <div className="p-3.5 border-b border-grey-light flex items-center justify-between bg-ivory-warm/40">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-forest text-sm">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-terracotta/10 text-terracotta font-semibold">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-medium text-forest hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-grey-light/50">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-charcoal-muted">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-charcoal-muted">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3.5 transition-colors hover:bg-ivory-warm/40 flex items-start gap-3 ${
                    !n.isRead ? 'bg-forest/[0.03]' : ''
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      !n.isRead ? 'bg-terracotta' : 'bg-transparent'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-semibold text-charcoal truncate">
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-charcoal-muted whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal-muted mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    {n.caseId && (
                      <div className="mt-1.5 flex items-center justify-between">
                        <Link
                          to={
                            n.caseId?.verificationStatus === 'Approved'
                              ? `/cases/${n.caseId._id || n.caseId}`
                              : `/rescuer/cases`
                          }
                          onClick={() => setIsOpen(false)}
                          className="text-[10px] font-medium text-forest hover:underline inline-flex items-center gap-1"
                        >
                          View Case details <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                        {!n.isRead && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(n._id, e)}
                            className="text-[10px] text-charcoal-muted hover:text-forest"
                            title="Mark as read"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-grey-light text-center bg-ivory-warm/20">
            <Link
              to="/rescuer/cases"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-semibold text-forest hover:underline"
            >
              Go to Rescuer Submissions
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
