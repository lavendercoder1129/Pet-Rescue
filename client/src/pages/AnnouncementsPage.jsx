import { useState, useEffect } from 'react';
import {
  Megaphone,
  AlertCircle,
  AlertTriangle,
  Info,
  Calendar,
  Flame,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { getActiveAnnouncements } from '../services/api';
import Container from '../components/layout/Container';
import Section from '../components/layout/Section';
import BaseCard from '../components/cards/BaseCard';
import LoadingState from '../components/feedback/LoadingState';
import EmptyState from '../components/feedback/EmptyState';

export const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActiveAnnouncements();
      if (data && data.success) {
        setAnnouncements(data.announcements || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load active announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container size="default">
        {/* Header */}
        <div className="pb-6 border-b border-grey-light mb-8 font-sans">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest">
              Public Bulletins
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-forest text-ivory font-medium">
              Live Updates
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
            Platform & Emergency Announcements
          </h1>
          <p className="text-xs text-charcoal-muted mt-1">
            Official platform alerts, severe weather notices, street animal medical triage advisories, and volunteer mobilization news.
          </p>
        </div>

        {/* Global Academic Disclosure */}
        <div className="rounded-2xl p-4 mb-8 bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-3 shadow-warm-xs font-sans">
          <AlertCircle className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="block text-sm font-serif font-bold text-amber-950">
              Academic Demonstration Broadcasts
            </strong>
            <p className="leading-relaxed text-[11px]">
              All platform advisories, emergency alerts, and clinic schedules shown here are demonstration announcements simulated for educational purposes. In the event of a real animal emergency, please contact local municipal veterinary control.
            </p>
          </div>
        </div>

        {/* List of active announcements */}
        {loading ? (
          <div className="py-16">
            <LoadingState
              message="Loading official announcements..."
              subtext="Retrieving prioritized alerts from administrators"
            />
          </div>
        ) : error ? (
          <div className="py-12">
            <EmptyState icon={AlertTriangle} title="Unable to Load" description={error} />
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Megaphone}
              title="No Active Announcements"
              description="There are currently no active public alerts or platform notices."
            />
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            {announcements.map((a) => {
              const isEmergency = a.type === 'emergency';
              const isUrgent = a.type === 'urgent';

              return (
                <BaseCard
                  key={a._id}
                  padding="lg"
                  className={`border transition-all ${
                    isEmergency
                      ? 'bg-rose-50/80 border-rose-300 shadow-warm-sm'
                      : isUrgent
                      ? 'bg-amber-50/60 border-amber-300 shadow-warm-xs'
                      : 'bg-white border-grey-light shadow-warm-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-grey-light/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isEmergency
                            ? 'bg-rose-700 text-white'
                            : isUrgent
                            ? 'bg-amber-600 text-white'
                            : 'bg-forest text-white'
                        }`}
                      >
                        {a.type}
                      </span>
                      <span className="text-xs font-semibold text-charcoal">
                        {isEmergency
                          ? 'Priority Emergency Alert'
                          : isUrgent
                          ? 'Urgent Advisory'
                          : 'Platform Notice'}
                      </span>
                    </div>

                    <div className="text-xs text-charcoal-muted flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        Published: {new Date(a.publishedAt || a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h2
                      className={`font-serif text-xl sm:text-2xl font-bold ${
                        isEmergency
                          ? 'text-rose-950'
                          : isUrgent
                          ? 'text-amber-950'
                          : 'text-forest'
                      }`}
                    >
                      {a.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-charcoal leading-relaxed mt-2 whitespace-pre-line font-sans">
                      {a.message}
                    </p>
                  </div>
                </BaseCard>
              );
            })}
          </div>
        )}
      </Container>
    </Section>
  );
};

export default AnnouncementsPage;
