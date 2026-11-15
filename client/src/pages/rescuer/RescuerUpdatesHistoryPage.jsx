import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowLeft,
  Calendar,
  Layers,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { getMyUpdates } from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import StatusBadge from '../../components/feedback/StatusBadge';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';

export const RescuerUpdatesHistoryPage = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyUpdates({ status: statusFilter, page, limit: 10 });
      if (data && data.success) {
        setUpdates(data.updates || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to load update history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [statusFilter, page]);

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container size="default">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8 font-sans">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                to="/rescuer/updates"
                className="inline-flex items-center text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors mr-2"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Cases
              </Link>
              <span className="text-xs font-semibold uppercase tracking-wider text-forest">
                Rescuer Intake
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Submitted Progress Updates
            </h1>
            <p className="text-xs text-charcoal-muted mt-1">
              Review administrative moderation feedback, publication status, and revision requests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/rescuer/updates/new">
              <PrimaryButton size="sm" icon={PlusCircle}>
                New Update
              </PrimaryButton>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-grey-light pb-2 font-sans overflow-x-auto">
          {['all', 'pending', 'published', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === tab
                  ? 'bg-forest text-ivory shadow-warm-xs'
                  : 'text-charcoal-muted hover:text-charcoal hover:bg-grey-light/40'
              }`}
            >
              {tab === 'all' ? 'All Updates' : tab}
            </button>
          ))}
        </div>

        {/* Content Table / Cards */}
        {loading ? (
          <div className="py-16">
            <LoadingState
              message="Loading your submitted updates..."
              subtext="Retrieving administrative moderation statuses"
            />
          </div>
        ) : error ? (
          <div className="py-12">
            <EmptyState
              icon={AlertCircle}
              title="Unable to Load Updates"
              description={error}
            />
          </div>
        ) : updates.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Layers}
              title="No Updates Found"
              description={`You have no ${statusFilter === 'all' ? '' : statusFilter} progress updates.`}
              action={
                <Link to="/rescuer/updates/new">
                  <PrimaryButton size="sm" icon={PlusCircle}>
                    Create Milestone Update
                  </PrimaryButton>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            {updates.map((u) => {
              const caseInfo = u.caseId || {};
              return (
                <BaseCard
                  key={u._id}
                  padding="md"
                  className="bg-white shadow-warm-xs border border-grey-light hover:shadow-warm-sm transition-shadow space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-grey-light/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <StatusBadge
                        status={
                          u.status === 'published'
                            ? 'verified'
                            : u.status === 'rejected'
                            ? 'rejected'
                            : 'pending'
                        }
                        label={u.status}
                      />
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-sage/20 text-forest font-semibold capitalize">
                        {u.milestone}
                      </span>
                      <span className="text-xs font-mono text-charcoal-muted">
                        Case: {caseInfo.animalName || 'Rescue Case'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-charcoal-muted">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-forest">
                      {u.title}
                    </h3>
                    <p className="text-xs text-charcoal-muted mt-1 leading-relaxed whitespace-pre-line">
                      {u.description}
                    </p>
                  </div>

                  {/* Images Preview Strip */}
                  {u.images && u.images.length > 0 && (
                    <div className="flex items-center gap-2.5 pt-2 overflow-x-auto">
                      {u.images.map((img, i) => (
                        <div
                          key={i}
                          className="w-16 h-16 rounded-xl overflow-hidden border border-grey-light flex-shrink-0 bg-ivory-warm"
                        >
                          <img
                            src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                            alt={`update-thumb-${i}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Admin Feedback Banner if rejected */}
                  {u.status === 'rejected' && u.adminFeedback && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                      <strong className="font-semibold block flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                        Admin Feedback:
                      </strong>
                      <p className="leading-relaxed pl-5">{u.adminFeedback}</p>
                    </div>
                  )}

                  {/* Bottom Actions */}
                  <div className="pt-2 flex items-center justify-between border-t border-grey-light/60 text-xs">
                    <span className="text-charcoal-muted text-[11px]">
                      {u.status === 'published'
                        ? 'Live on Public Timeline'
                        : u.status === 'rejected'
                        ? 'Requires Revision'
                        : 'Awaiting Administrator Audit'}
                    </span>

                    <div className="flex items-center gap-3">
                      {caseInfo._id && (
                        <Link
                          to={`/cases/${caseInfo._id}`}
                          className="text-forest hover:underline font-semibold inline-flex items-center gap-1"
                        >
                          Case Details <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </BaseCard>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6 flex items-center justify-center gap-2 font-sans">
                <OutlineButton
                  size="xs"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </OutlineButton>
                <span className="text-xs text-charcoal-muted px-2">
                  Page {page} of {totalPages}
                </span>
                <OutlineButton
                  size="xs"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </OutlineButton>
              </div>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
};

export default RescuerUpdatesHistoryPage;
