import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, AlertCircle, ArrowRight, X } from 'lucide-react';
import { getActiveAnnouncements } from '../../services/api';
import Container from '../layout/Container';

export const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedIds, setDismissedIds] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await getActiveAnnouncements();
        if (data && data.success && Array.isArray(data.announcements)) {
          setAnnouncements(data.announcements);
        }
      } catch {
        // Non-blocking
      }
    };
    fetchAnnouncements();
  }, []);

  const activeVisible = announcements.filter((a) => !dismissedIds.includes(a._id));
  if (activeVisible.length === 0) return null;

  // Pick top priority announcement
  const topAnnouncement = activeVisible[0];
  const isEmergency = topAnnouncement.type === 'emergency';
  const isUrgent = topAnnouncement.type === 'urgent';

  const handleDismiss = (id) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  return (
    <div
      className={`border-b transition-colors font-sans ${
        isEmergency
          ? 'bg-rose-900 text-white border-rose-950'
          : isUrgent
          ? 'bg-amber-800 text-white border-amber-950'
          : 'bg-forest text-ivory border-forest/80'
      }`}
    >
      <Container size="default">
        <div className="py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
                isEmergency
                  ? 'bg-white text-rose-900'
                  : isUrgent
                  ? 'bg-white text-amber-900'
                  : 'bg-white/20 text-white'
              }`}
            >
              {topAnnouncement.type}
            </span>
            <div className="truncate flex items-center gap-2">
              <strong className="font-semibold truncate">
                {topAnnouncement.title}:
              </strong>
              <span className="hidden sm:inline text-white/90 truncate">
                {topAnnouncement.message}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/announcements"
              className="text-[11px] font-semibold underline hover:text-white/80 inline-flex items-center gap-0.5"
            >
              Details <ArrowRight className="w-3 h-3" />
            </Link>
            <button
              type="button"
              onClick={() => handleDismiss(topAnnouncement._id)}
              className="p-1 hover:bg-black/20 rounded-full transition-colors"
              title="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default AnnouncementBanner;
