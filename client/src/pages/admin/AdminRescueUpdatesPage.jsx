import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Eye,
  Megaphone,
} from 'lucide-react';
import {
  getAdminRescueUpdates,
  approveAdminRescueUpdate,
  rejectAdminRescueUpdate,
} from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import StatCard from '../../components/cards/StatCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import StatusBadge from '../../components/feedback/StatusBadge';
import FormInput from '../../components/forms/FormInput';
import FormTextarea from '../../components/forms/FormTextarea';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';

export const AdminRescueUpdatesPage = () => {
  const [updates, setUpdates] = useState([]);
  const [stats, setStats] = useState({
    totalSubmitted: 0,
    pendingCount: 0,
    publishedCount: 0,
    rejectedCount: 0,
  });
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State for Review Actions
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [feedbackNote, setFeedbackNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminRescueUpdates({
        status: statusFilter,
        search: searchQuery,
        page,
        limit: 12,
      });

      if (data && data.success) {
        setUpdates(data.updates || []);
        setStats(data.stats || {});
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to load rescue updates queue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUpdates();
  };

  const handleOpenActionModal = (update, type) => {
    setSelectedUpdate(update);
    setActionType(type);
    setFeedbackNote('');
    setActionError('');
  };

  const handleCloseModal = () => {
    setSelectedUpdate(null);
    setActionType(null);
    setFeedbackNote('');
    setActionError('');
  };

  const handleConfirmDecision = async () => {
    if (actionType === 'reject' && !feedbackNote.trim()) {
      setActionError('A mandatory rejection reason is required.');
      return;
    }

    try {
      setActionLoading(true);
      setActionError('');

      if (actionType === 'approve') {
        await approveAdminRescueUpdate(selectedUpdate._id, feedbackNote);
      } else {
        await rejectAdminRescueUpdate(selectedUpdate._id, feedbackNote);
      }

      setActionLoading(false);
      handleCloseModal();
      fetchUpdates();
    } catch (err) {
      setActionLoading(false);
      setActionError(err.message || 'Failed to process decision.');
    }
  };

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container size="default">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8 font-sans">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-800">
                Admin Control Center
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-700 text-white font-medium">
                Clinical Moderation
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Rescue Updates Moderation Queue
            </h1>
            <p className="text-xs text-charcoal-muted mt-1">
              Review progress updates, verify clinical photographs, and publish authenticated recovery milestones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/admin/announcements">
              <OutlineButton size="sm" icon={Megaphone}>
                Announcements
              </OutlineButton>
            </Link>
            <OutlineButton size="sm" icon={RefreshCw} onClick={fetchUpdates}>
              Refresh
            </OutlineButton>
          </div>
        </div>

        {/* 4 Stat KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 font-sans">
          <StatCard
            title="Total Submitted"
            value={String(stats.totalSubmitted || 0)}
            subtitle="All recorded updates"
            colorScheme="charcoal"
            icon={Filter}
          />
          <StatCard
            title="Pending Review"
            value={String(stats.pendingCount || 0)}
            subtitle="Requires admin audit"
            colorScheme="orange"
            icon={Clock}
          />
          <StatCard
            title="Published & Live"
            value={String(stats.publishedCount || 0)}
            subtitle="Visible on case timelines"
            colorScheme="forest"
            icon={CheckCircle2}
          />
          <StatCard
            title="Rejected Updates"
            value={String(stats.rejectedCount || 0)}
            subtitle="Returned for revision"
            colorScheme="sage"
            icon={XCircle}
          />
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 font-sans">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['pending', 'published', 'rejected', 'all'].map((tab) => (
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

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-sm w-full">
            <FormInput
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs"
            />
            <PrimaryButton size="sm" type="submit" icon={Search}>
              Search
            </PrimaryButton>
          </form>
        </div>

        {/* List of Updates */}
        {loading ? (
          <div className="py-16">
            <LoadingState
              message="Loading updates moderation queue..."
              subtext="Aggregating rescuer reports and uploaded recovery photos"
            />
          </div>
        ) : error ? (
          <div className="py-12">
            <EmptyState
              icon={AlertCircle}
              title="Queue Unavailable"
              description={error}
            />
          </div>
        ) : updates.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No Updates Found"
              description={`There are currently no ${statusFilter === 'all' ? '' : statusFilter} rescue updates in the queue.`}
            />
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            {updates.map((u) => {
              const caseInfo = u.caseId || {};
              const rescuer = u.rescuerId || {};

              return (
                <BaseCard
                  key={u._id}
                  padding="lg"
                  className="bg-white shadow-warm-xs border border-grey-light space-y-4 hover:shadow-warm-sm transition-shadow"
                >
                  {/* Top Metas */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-grey-light/60 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
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
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-forest/10 text-forest font-semibold capitalize">
                        Milestone: {u.milestone}
                      </span>
                      <span className="text-xs font-semibold text-charcoal">
                        Case: {caseInfo.animalName || 'Rescue Case'}
                      </span>
                      <span className="text-[11px] text-charcoal-muted">
                        by {rescuer.name || 'Rescuer'} ({rescuer.email})
                      </span>
                    </div>

                    <span className="text-xs font-mono text-charcoal-muted">
                      Submitted: {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div>
                    <h3 className="font-serif text-xl font-bold text-forest">
                      {u.title}
                    </h3>
                    <p className="text-xs text-charcoal leading-relaxed mt-1.5 whitespace-pre-line">
                      {u.description}
                    </p>
                  </div>

                  {/* Images Grid */}
                  {u.images && u.images.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-charcoal-muted block">
                        Uploaded Recovery Evidence ({u.images.length} image{u.images.length > 1 ? 's' : ''}):
                      </span>
                      <div className="flex items-center gap-3 overflow-x-auto pb-1">
                        {u.images.map((img, idx) => (
                          <a
                            key={idx}
                            href={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-24 h-24 rounded-xl overflow-hidden border border-grey-light bg-ivory-warm flex-shrink-0 group relative"
                          >
                            <img
                              src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                              alt={`proof-${idx}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-charcoal/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs">
                              <Eye className="w-4 h-4" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback display if rejected */}
                  {u.status === 'rejected' && u.adminFeedback && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                      <strong>Rejection Note:</strong> {u.adminFeedback}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-grey-light/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-charcoal-muted flex items-center gap-2">
                      {caseInfo._id && (
                        <Link
                          to={`/cases/${caseInfo._id}`}
                          target="_blank"
                          className="hover:underline text-forest font-semibold inline-flex items-center gap-1"
                        >
                          View Public Case Details <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {u.status !== 'published' && (
                        <PrimaryButton
                          size="xs"
                          icon={CheckCircle2}
                          onClick={() => handleOpenActionModal(u, 'approve')}
                        >
                          Approve & Publish
                        </PrimaryButton>
                      )}
                      {u.status !== 'rejected' && (
                        <OutlineButton
                          size="xs"
                          icon={XCircle}
                          onClick={() => handleOpenActionModal(u, 'reject')}
                          className="text-rose-800 border-rose-300 hover:bg-rose-50"
                        >
                          Reject
                        </OutlineButton>
                      )}
                    </div>
                  </div>
                </BaseCard>
              );
            })}

            {/* Pagination */}
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

        {/* Confirmation Modal */}
        {selectedUpdate && (
          <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-warm-lg border border-grey-light space-y-4 font-sans animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between border-b border-grey-light pb-3">
                <div className="flex items-center gap-2">
                  {actionType === 'approve' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-700" />
                  )}
                  <h3 className="font-serif text-lg font-bold text-forest">
                    {actionType === 'approve' ? 'Approve & Publish Update' : 'Reject Rescue Update'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-charcoal-muted hover:text-charcoal"
                >
                  ✕
                </button>
              </div>

              {actionError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {actionError}
                </div>
              )}

              <div className="text-xs text-charcoal-muted space-y-2">
                <p>
                  You are evaluating progress report: <strong>"{selectedUpdate.title}"</strong> for{' '}
                  <strong>{selectedUpdate.caseId?.animalName || 'Rescue Case'}</strong>.
                </p>
                {actionType === 'approve' ? (
                  <p className="text-emerald-900 font-medium">
                    Approving this update will immediately publish it to the public timeline on the case details page.
                  </p>
                ) : (
                  <p className="text-rose-900 font-medium">
                    Rejecting will return this update to the rescuer with your feedback so they can revise and resubmit.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-charcoal">
                  {actionType === 'approve'
                    ? 'Optional Editorial Note'
                    : 'Rejection Reason / Required Feedback *'}
                </label>
                <FormTextarea
                  rows={3}
                  placeholder={
                    actionType === 'approve'
                      ? 'Approved without changes / Good progress photos...'
                      : 'Please explain what needs correction (e.g. illegible photos, missing discharge info)...'
                  }
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  required={actionType === 'reject'}
                />
              </div>

              <div className="pt-3 border-t border-grey-light flex items-center justify-end gap-2.5">
                <OutlineButton size="sm" onClick={handleCloseModal} disabled={actionLoading}>
                  Cancel
                </OutlineButton>
                <PrimaryButton
                  size="sm"
                  onClick={handleConfirmDecision}
                  disabled={actionLoading}
                  className={actionType === 'reject' ? 'bg-rose-700 hover:bg-rose-800' : ''}
                >
                  {actionLoading
                    ? 'Processing...'
                    : actionType === 'approve'
                    ? 'Confirm & Publish'
                    : 'Confirm Rejection'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
};

export default AdminRescueUpdatesPage;
