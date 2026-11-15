import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { getMyEligibleCases } from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import UrgencyBadge from '../../components/feedback/UrgencyBadge';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';

export const RescuerCasesUpdatesPage = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyEligibleCases();
        if (data && data.success) {
          setCases(data.cases || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load eligible rescue cases.');
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container size="default">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest font-sans">
                Rescuer Clinical Journal
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-forest text-ivory font-medium">
                Milestone Updates
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              My Rescue Cases & Recovery Logs
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 font-sans">
              Document medical progress, post-surgery recovery, and release milestones for approved campaigns.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/rescuer/updates/history">
              <OutlineButton size="sm" icon={History}>
                Update History
              </OutlineButton>
            </Link>
            <Link to="/rescuer/updates/new">
              <PrimaryButton size="sm" icon={PlusCircle}>
                Post Progress Update
              </PrimaryButton>
            </Link>
          </div>
        </div>

        {/* Global Academic Notice */}
        <div className="rounded-2xl p-4 mb-8 bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-3 shadow-warm-xs">
          <AlertCircle className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5 font-sans">
            <strong className="block text-sm font-serif font-bold text-amber-950">
              Clinical Progress Simulation & Moderation Notice
            </strong>
            <p className="leading-relaxed text-[11px]">
              All recovery milestones, veterinary reports, and animal photographs are reviewed by platform administrators before publication to the public timeline. Fictional progress reports are for academic demonstration purposes.
            </p>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-16">
            <LoadingState
              message="Loading your active rescue cases..."
              subtext="Retrieving clinical recovery statuses and published logs"
            />
          </div>
        ) : error ? (
          <div className="py-12">
            <EmptyState
              icon={AlertCircle}
              title="Unable to Load Rescue Cases"
              description={error}
            />
          </div>
        ) : cases.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={ShieldAlert}
              title="No Eligible Approved Cases Found"
              description="You must have an approved rescue case before posting milestone updates."
              action={
                <Link to="/rescuer/cases/new">
                  <PrimaryButton size="sm" icon={PlusCircle}>
                    Submit a Rescue Case
                  </PrimaryButton>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
            {cases.map((c) => {
              const primaryImg =
                c.images && c.images.length > 0
                  ? c.images[0].startsWith('http')
                    ? c.images[0]
                    : `http://localhost:5000${c.images[0]}`
                  : 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80';

              return (
                <BaseCard
                  key={c._id}
                  padding="md"
                  className="space-y-4 bg-white shadow-warm-xs border border-grey-light flex flex-col justify-between hover:shadow-warm-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-ivory-warm flex-shrink-0 border border-grey-light">
                        <img
                          src={primaryImg}
                          alt={c.animalName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <UrgencyBadge level={c.urgencyLevel ? c.urgencyLevel.toLowerCase() : 'moderate'} />
                          <span className="text-[10px] text-charcoal-muted uppercase font-semibold">
                            {c.animalType}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-base text-forest truncate mt-0.5">
                          {c.animalName}
                        </h3>
                        <p className="text-xs text-charcoal-muted truncate">
                          {c.title}
                        </p>
                      </div>
                    </div>

                    {/* Progress Meta */}
                    <div className="p-3 rounded-xl bg-ivory-warm/60 border border-grey-light/60 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-charcoal-muted">Published Updates:</span>
                        <span className="font-semibold text-forest">
                          {c.publishedUpdatesCount || 0} milestone(s)
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-charcoal-muted">Latest Update:</span>
                        <span className="text-charcoal font-medium">
                          {c.latestUpdate
                            ? new Date(c.latestUpdate.createdAt).toLocaleDateString()
                            : 'None yet'}
                        </span>
                      </div>
                      {c.latestUpdate && (
                        <div className="pt-1 border-t border-grey-light/60 flex items-center justify-between text-[11px]">
                          <span className="text-charcoal-muted">Current Stage:</span>
                          <span className="capitalize font-semibold text-sage-dark">
                            {c.latestUpdate.milestone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-grey-light flex items-center justify-between gap-2">
                    <Link
                      to={`/cases/${c._id}`}
                      className="text-xs text-forest hover:underline font-semibold"
                    >
                      View Public Timeline
                    </Link>
                    <Link to={`/rescuer/updates/new?caseId=${c._id}`}>
                      <PrimaryButton size="xs" icon={PlusCircle}>
                        Add Update
                      </PrimaryButton>
                    </Link>
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

export default RescuerCasesUpdatesPage;
