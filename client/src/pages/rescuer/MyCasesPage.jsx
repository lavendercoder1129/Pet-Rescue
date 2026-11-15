import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Eye,
  RefreshCw,
  AlertCircle,
  MapPin,
  Calendar,
} from 'lucide-react';
import { getMyCases } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import UrgencyBadge from '../../components/feedback/UrgencyBadge';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';

export const MyCasesPage = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isApproved = user?.role === 'admin' || user?.rescuerVerificationStatus === 'approved';

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyCases();
      if (data && data.success) {
        setCases(data.cases || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve your rescue submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest font-sans">
                Rescuer Management
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-forest text-ivory font-medium">
                {cases.length} Total Submissions
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              My Rescue Cases
            </h1>
            <p className="text-xs text-charcoal-muted mt-1">
              Track the verification status, administrative notes, and simulated crowdfunding of cases you have submitted.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <OutlineButton size="sm" icon={RefreshCw} onClick={fetchCases}>
              Refresh
            </OutlineButton>

            <Link to="/rescuer/cases/new">
              <PrimaryButton size="sm" icon={PlusCircle} disabled={!isApproved}>
                Submit New Case
              </PrimaryButton>
            </Link>
          </div>
        </div>

        {/* Unverified Rescuer Warning */}
        {!isApproved && (
          <div className="rounded-xl p-4 mb-8 bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-800 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Account Verification Pending:</strong> Your rescuer profile is awaiting admin approval. You can view previously assigned records, but case publishing is paused until your credentials are confirmed.
            </div>
          </div>
        )}

        {/* Content States */}
        {loading ? (
          <div className="py-16">
            <LoadingState
              message="Loading your submitted cases..."
              subtext="Retrieving records from database"
            />
          </div>
        ) : error ? (
          <div className="py-12">
            <EmptyState
              icon={AlertCircle}
              title="Failed to Load Cases"
              description={error}
              action={
                <OutlineButton icon={RefreshCw} onClick={fetchCases}>
                  Retry
                </OutlineButton>
              }
            />
          </div>
        ) : cases.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No Rescue Cases Submitted Yet"
              description="You have not reported any injured stray animal cases. Submit your first emergency case when an animal needs care."
              action={
                <Link to="/rescuer/cases/new">
                  <PrimaryButton icon={PlusCircle} disabled={!isApproved}>
                    Submit Emergency Case
                  </PrimaryButton>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((c) => {
              const firstImage =
                c.images && c.images.length > 0
                  ? c.images[0].startsWith('http')
                    ? c.images[0]
                    : `http://localhost:5000${c.images[0]}`
                  : null;

              return (
                <BaseCard key={c._id} padding="md" className="space-y-4 bg-white">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left preview info */}
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-xl bg-ivory-warm overflow-hidden flex-shrink-0 border border-grey-light">
                        {firstImage ? (
                          <img
                            src={firstImage}
                            alt={c.animalName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-forest text-xs font-serif font-bold">
                            {c.animalName}
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <UrgencyBadge level={c.urgencyLevel.toLowerCase()} />
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                            c.verificationStatus === 'Approved'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : c.verificationStatus === 'Rejected'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            Verification: {c.verificationStatus}
                          </span>
                        </div>

                        <h3 className="font-serif text-lg font-bold text-forest">
                          {c.title}
                        </h3>

                        <div className="flex items-center gap-4 text-xs text-charcoal-muted flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-sage-dark" />
                            {c.location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-sage-dark" />
                            Submitted {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right financial & action */}
                    <div className="flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-grey-light">
                      <div className="text-right">
                        <span className="text-xs text-charcoal-muted block">Simulated Goal</span>
                        <span className="font-serif font-bold text-forest text-lg">
                          ₹{c.amountCollected.toLocaleString()} / ₹{c.fundraisingGoal.toLocaleString()}
                        </span>
                      </div>

                      {c.verificationStatus === 'Approved' ? (
                        <Link to={`/cases/${c._id}`}>
                          <OutlineButton size="sm" icon={Eye}>
                            View Public Page
                          </OutlineButton>
                        </Link>
                      ) : (
                        <span className="text-[11px] text-charcoal-muted italic">
                          {c.verificationStatus === 'Pending' ? 'In Admin Queue' : 'Rejected by Admin'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Admin review note if available */}
                  {c.reviewNote && (
                    <div className={`p-3 rounded-xl text-xs ${
                      c.verificationStatus === 'Approved'
                        ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-900'
                        : 'bg-rose-50/80 border border-rose-200 text-rose-900'
                    }`}>
                      <strong>Admin Review Note:</strong> {c.reviewNote}
                    </div>
                  )}
                </BaseCard>
              );
            })}
          </div>
        )}
      </Container>
    </Section>
  );
};

export default MyCasesPage;
