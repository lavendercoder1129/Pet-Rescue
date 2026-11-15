import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  MapPin,
  Clock,
  History,
  CheckSquare,
  Square,
  AlertTriangle,
  UserCheck,
  FileText,
} from 'lucide-react';
import {
  getAdminCaseById,
  getCaseAuditHistory,
  approveAdminCase,
  rejectAdminCase,
} from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import FormTextarea from '../../components/forms/FormTextarea';
import UrgencyBadge from '../../components/feedback/UrgencyBadge';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';

export const AdminCaseReviewPage = () => {
  const { id } = useParams();

  const [rescueCase, setRescueCase] = useState(null);
  const [rescuerPreviousCases, setRescuerPreviousCases] = useState([]);
  const [auditHistory, setAuditHistory] = useState([]);
  const [reviewNote, setReviewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  // Administrative verification review checklist state
  const [checklist, setChecklist] = useState({
    photosReviewed: false,
    emergencyReviewed: false,
    locationReviewed: false,
    campaignReviewed: false,
    rescuerEligibilityChecked: false,
  });

  // Modal confirmation states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchCase = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [caseData, historyData] = await Promise.all([
        getAdminCaseById(id),
        getCaseAuditHistory(id).catch(() => ({ history: [] })),
      ]);

      if (caseData && caseData.success && caseData.case) {
        setRescueCase(caseData.case);
        setRescuerPreviousCases(caseData.rescuerPreviousCases || []);
        if (caseData.case.reviewNote) {
          setReviewNote(caseData.case.reviewNote);
        }
      }
      if (historyData && historyData.success) {
        setAuditHistory(historyData.history || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load case details for review.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  const toggleChecklist = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecklistItemsChecked = Object.values(checklist).every(Boolean);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const res = await approveAdminCase(id, reviewNote);
      setActionLoading(false);
      setShowApproveModal(false);
      if (res && res.success) {
        setActionMessage('Case has been approved and activated for public crowdfunding.');
        fetchCase();
      }
    } catch (err) {
      setActionLoading(false);
      alert(err.message || 'Approval failed.');
    }
  };

  const handleReject = async () => {
    if (!reviewNote.trim()) {
      alert('Please provide a rejection reason before rejecting this case.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await rejectAdminCase(id, reviewNote, reviewNote);
      setActionLoading(false);
      setShowRejectModal(false);
      if (res && res.success) {
        setActionMessage('Case has been rejected. It remains hidden from public crowdfunding.');
        fetchCase();
      }
    } catch (err) {
      setActionLoading(false);
      alert(err.message || 'Rejection failed.');
    }
  };

  if (loading) {
    return (
      <Section spacing="default">
        <Container>
          <div className="py-20">
            <LoadingState
              message="Loading case dossier for administrative review..."
              subtext="Retrieving trauma history, rescuer profile, and append-only audit trail"
            />
          </div>
        </Container>
      </Section>
    );
  }

  if (error || !rescueCase) {
    return (
      <Section spacing="default">
        <Container size="narrow">
          <EmptyState
            icon={AlertCircle}
            title="Case Record Unavailable"
            description={error || 'The requested case could not be retrieved from the admin audit queue.'}
            action={
              <Link to="/admin/cases">
                <PrimaryButton icon={ArrowLeft}>
                  Return to Admin Review Queue
                </PrimaryButton>
              </Link>
            }
          />
        </Container>
      </Section>
    );
  }

  const images =
    rescueCase.images && rescueCase.images.length > 0
      ? rescueCase.images.map((img) =>
          img.startsWith('http') ? img : `http://localhost:5000${img}`
        )
      : ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80'];

  const isPending = rescueCase.verificationStatus === 'Pending';

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container>
        {/* Back navigation & Metadata */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/admin/cases"
            className="inline-flex items-center text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Review Queue
          </Link>

          <div className="flex items-center gap-3 text-xs font-mono text-charcoal-muted">
            <span>Case ID: {rescueCase._id}</span>
            <span>•</span>
            <span>Created: {new Date(rescueCase.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action notification banner */}
        {actionMessage && (
          <div className="rounded-xl p-4 mb-6 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Decision status alert */}
        {!isPending && (
          <div
            className={`rounded-2xl p-4 mb-6 border text-xs flex items-center justify-between gap-4 ${
              rescueCase.verificationStatus === 'Approved'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/70 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {rescueCase.verificationStatus === 'Approved' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <div>
                <strong>
                  This case was reviewed and marked as {rescueCase.verificationStatus}.
                </strong>
                {rescueCase.reviewedAt && (
                  <span className="block text-[11px] text-charcoal-muted mt-0.5">
                    Reviewed on {new Date(rescueCase.reviewedAt).toLocaleString()} by{' '}
                    {rescueCase.reviewedBy?.name || 'Administrator'}
                  </span>
                )}
              </div>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white border border-grey-light">
              Decision Finalized
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Dossier Column */}
          <div className="lg:col-span-8 space-y-6">
            <BaseCard padding="lg" className="space-y-6 bg-white shadow-warm-xs">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-grey-light pb-4">
                <div className="flex items-center gap-2.5">
                  <UrgencyBadge level={rescueCase.urgencyLevel.toLowerCase()} />
                  <span className="text-xs font-semibold uppercase text-forest bg-forest-subtle px-2.5 py-0.5 rounded-full">
                    {rescueCase.animalType}
                  </span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    rescueCase.verificationStatus === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : rescueCase.verificationStatus === 'Rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Status: {rescueCase.verificationStatus}
                </span>
              </div>

              {/* Title & Animal Specs */}
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest">
                  {rescueCase.title}
                </h1>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 p-3.5 bg-ivory-warm/60 rounded-xl border border-grey-light text-xs font-sans">
                  <div>
                    <span className="text-[10px] text-charcoal-muted block uppercase tracking-wider font-semibold">
                      Animal Name
                    </span>
                    <strong className="text-forest text-sm font-serif">
                      {rescueCase.animalName}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal-muted block uppercase tracking-wider font-semibold">
                      Breed
                    </span>
                    <span className="text-charcoal font-medium">{rescueCase.breed}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal-muted block uppercase tracking-wider font-semibold">
                      Age
                    </span>
                    <span className="text-charcoal font-medium">{rescueCase.age}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal-muted block uppercase tracking-wider font-semibold">
                      Gender
                    </span>
                    <span className="text-charcoal font-medium">{rescueCase.gender}</span>
                  </div>
                </div>
              </div>

              {/* Photos Gallery */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted block">
                    Uploaded Injury & Animal Photographs ({images.length})
                  </span>
                  <span className="text-[10px] text-charcoal-muted">
                    Click image to inspect trauma proofs
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((imgUrl, idx) => (
                    <a
                      key={idx}
                      href={imgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl overflow-hidden border border-grey-light aspect-[4/3] bg-ivory-warm group relative block"
                    >
                      <img
                        src={imgUrl}
                        alt={`Trauma proof ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-medium">
                        Open Full View
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2 pt-2 border-t border-grey-light">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted block">
                  Rescue Location & Landmark
                </span>
                <div className="flex items-start gap-2.5 text-xs text-charcoal bg-ivory-warm/60 p-3.5 rounded-xl border border-grey-light">
                  <MapPin className="w-4 h-4 text-sage-dark flex-shrink-0 mt-0.5" />
                  <span>{rescueCase.location}</span>
                </div>
              </div>

              {/* Case Narrative */}
              <div className="space-y-2 pt-2 border-t border-grey-light">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted block">
                  Overall Rescue Description
                </span>
                <p className="text-xs text-charcoal leading-relaxed whitespace-pre-line p-3.5 bg-ivory-warm/40 rounded-xl border border-grey-light">
                  {rescueCase.description}
                </p>
              </div>

              {/* Clinical Description */}
              <div className="space-y-3 pt-2 border-t border-grey-light">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted block">
                  Emergency & Trauma Diagnosis
                </span>
                <div className="p-4 rounded-xl bg-ivory-warm/50 border border-grey-light space-y-3 text-xs">
                  <div>
                    <span className="text-charcoal-muted block text-[11px] font-medium">
                      Injury Type:
                    </span>
                    <strong className="text-charcoal font-semibold">{rescueCase.injuryType}</strong>
                  </div>
                  <div>
                    <span className="text-charcoal-muted block text-[11px] font-medium">
                      Trauma Symptoms & Injury Details:
                    </span>
                    <p className="text-charcoal leading-relaxed">{rescueCase.injuryDescription}</p>
                  </div>
                  <div>
                    <span className="text-charcoal-muted block text-[11px] font-medium">
                      Medical Condition & Attending Clinic Plan:
                    </span>
                    <p className="text-charcoal leading-relaxed">{rescueCase.medicalCondition}</p>
                  </div>
                </div>
              </div>
            </BaseCard>

            {/* Audit History Trail */}
            <BaseCard padding="lg" className="space-y-4 bg-white shadow-warm-xs">
              <div className="flex items-center justify-between border-b border-grey-light pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-forest" />
                  <h3 className="font-serif text-lg font-bold text-forest">
                    Verification Audit History
                  </h3>
                </div>
                <span className="text-[11px] text-charcoal-muted font-mono">
                  Append-Only Trail ({auditHistory.length} logs)
                </span>
              </div>

              {auditHistory.length === 0 ? (
                <div className="py-6 text-center text-xs text-charcoal-muted">
                  No administrative actions recorded yet. Audit entries are logged automatically upon verification.
                </div>
              ) : (
                <div className="space-y-3">
                  {auditHistory.map((log) => (
                    <div
                      key={log._id}
                      className="p-3.5 rounded-xl border border-grey-light bg-ivory-warm/30 text-xs font-sans space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-forest flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              log.action === 'Approved'
                                ? 'bg-emerald-600'
                                : log.action === 'Rejected'
                                ? 'bg-rose-600'
                                : 'bg-amber-600'
                            }`}
                          />
                          Action: {log.action}
                        </span>
                        <span className="text-[10px] text-charcoal-muted font-mono">
                          {new Date(log.timestamp || log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-charcoal-muted flex items-center gap-3">
                        <span>Admin: {log.adminId?.name || 'Administrator'}</span>
                        <span>•</span>
                        <span>
                          Status Transition: {log.previousStatus} → {log.newStatus}
                        </span>
                      </div>
                      {log.reviewNote && (
                        <div className="p-2 rounded-lg bg-white border border-grey-light/70 text-[11px] text-charcoal italic">
                          "{log.reviewNote}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </BaseCard>
          </div>

          {/* Right Sidebar: Rescuer, Verification Checklist & Decision Panel */}
          <div className="lg:col-span-4 space-y-6">
            {/* Rescuer Profile Card */}
            <BaseCard padding="md" className="space-y-3 bg-white shadow-warm-xs">
              <div className="flex items-center gap-1.5 border-b border-grey-light pb-2 text-forest">
                <UserCheck className="w-4 h-4 text-forest" />
                <span className="text-xs font-semibold uppercase tracking-wider block">
                  Rescuer Information
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Rescuer Name:</span>
                  <strong className="text-charcoal">{rescueCase.createdBy?.name || 'Unknown'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Contact Email:</span>
                  <span className="font-mono">{rescueCase.createdBy?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Contact Phone:</span>
                  <span>{rescueCase.createdBy?.phone || 'Not authorized / Not provided'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-charcoal-muted">Verification Status:</span>
                  <span className="capitalize font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                    {rescueCase.createdBy?.rescuerVerificationStatus || 'approved'}
                  </span>
                </div>
              </div>

              {/* Previous submitted cases */}
              <div className="pt-2 border-t border-grey-light">
                <span className="text-[11px] font-semibold text-charcoal-muted uppercase block mb-1.5">
                  Previous Submitted Cases ({rescuerPreviousCases.length})
                </span>
                {rescuerPreviousCases.length === 0 ? (
                  <p className="text-[11px] text-charcoal-muted italic">
                    No prior cases submitted by this rescuer.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {rescuerPreviousCases.map((pc) => (
                      <Link
                        key={pc._id}
                        to={`/admin/cases/${pc._id}`}
                        className="block p-2 rounded-lg bg-ivory-warm/40 hover:bg-ivory-warm border border-grey-light/60 transition-colors text-[11px]"
                      >
                        <div className="font-semibold text-forest truncate">{pc.title}</div>
                        <div className="flex justify-between text-[10px] text-charcoal-muted mt-0.5">
                          <span>{pc.animalName}</span>
                          <span className="uppercase font-mono">{pc.verificationStatus}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </BaseCard>

            {/* Campaign Financial Targets */}
            <BaseCard padding="md" className="space-y-3 bg-white shadow-warm-xs">
              <div className="flex items-center gap-1.5 border-b border-grey-light pb-2 text-forest">
                <FileText className="w-4 h-4 text-forest" />
                <span className="text-xs font-semibold uppercase tracking-wider block">
                  Campaign Financials
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Estimated Treatment Cost:</span>
                  <strong className="text-charcoal">
                    ₹{rescueCase.estimatedTreatmentCost.toLocaleString()}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Fundraising Goal:</span>
                  <strong className="font-serif text-base text-forest">
                    ₹{rescueCase.fundraisingGoal.toLocaleString()}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Campaign Status:</span>
                  <span className="font-semibold text-charcoal">{rescueCase.campaignStatus}</span>
                </div>
              </div>
            </BaseCard>

            {/* Verification Checklist */}
            <BaseCard padding="md" className="space-y-3 bg-white border border-forest/20 shadow-warm-xs">
              <div className="flex items-center justify-between border-b border-grey-light pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-forest block">
                  Verification Checklist
                </span>
                <span className="text-[10px] text-charcoal-muted font-mono">
                  Review Aid
                </span>
              </div>
              <p className="text-[10px] text-charcoal-muted leading-tight">
                This checklist is an administrative review aid, not proof that the rescue is genuine.
              </p>

              <div className="space-y-2 pt-1">
                {[
                  { key: 'photosReviewed', label: 'Animal photographs reviewed' },
                  { key: 'emergencyReviewed', label: 'Emergency description reviewed' },
                  { key: 'locationReviewed', label: 'Location information reviewed' },
                  { key: 'campaignReviewed', label: 'Campaign information reviewed' },
                  { key: 'rescuerEligibilityChecked', label: 'Rescuer eligibility checked' },
                ].map(({ key, label }) => {
                  const checked = checklist[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleChecklist(key)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-ivory-warm/60 transition-colors text-left text-xs text-charcoal"
                    >
                      {checked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-charcoal-muted flex-shrink-0" />
                      )}
                      <span className={checked ? 'line-through text-charcoal-muted' : ''}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </BaseCard>

            {/* Admin Decision Action Card */}
            <BaseCard
              padding="lg"
              className="space-y-4 bg-white border-2 border-forest/20 shadow-warm"
            >
              <div className="flex items-center gap-2 text-forest">
                <ShieldCheck className="w-5 h-5 text-forest" />
                <h3 className="font-serif text-lg font-bold">
                  Administrative Decision
                </h3>
              </div>

              <FormTextarea
                id="adminReviewNote"
                label="Verification Note / Rejection Reason"
                placeholder="Enter verification notes, clinic invoice review, or detailed reason if rejecting..."
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                helperText="Required if rejecting. Stored in append-only audit trail and notified to rescuer."
              />

              <div className="space-y-2 pt-2">
                <PrimaryButton
                  size="md"
                  icon={CheckCircle2}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                  disabled={!isPending && rescueCase.verificationStatus === 'Approved'}
                  onClick={() => setShowApproveModal(true)}
                >
                  Approve Case & Activate Campaign
                </PrimaryButton>

                <OutlineButton
                  size="md"
                  icon={XCircle}
                  className="w-full text-rose-700 border-rose-200 hover:bg-rose-50"
                  disabled={!isPending && rescueCase.verificationStatus === 'Rejected'}
                  onClick={() => setShowRejectModal(true)}
                >
                  Reject Case
                </OutlineButton>
              </div>
            </BaseCard>
          </div>
        </div>

        {/* Confirmation Modal: Approval */}
        {showApproveModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-warm border border-grey-light space-y-4 font-sans animate-fade-in">
              <div className="flex items-center gap-3 text-emerald-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold">Confirm Approval</h3>
                  <span className="text-xs text-charcoal-muted">Case Verification Action</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-ivory-warm border border-grey-light text-xs space-y-1.5">
                <div>
                  <strong>Case:</strong> {rescueCase.title}
                </div>
                <div>
                  <strong>Animal:</strong> {rescueCase.animalName} ({rescueCase.breed})
                </div>
                <div>
                  <strong>Goal:</strong> ₹{rescueCase.fundraisingGoal.toLocaleString()}
                </div>
                {reviewNote && (
                  <div>
                    <strong>Review Note:</strong> "{reviewNote}"
                  </div>
                )}
              </div>

              <p className="text-xs text-charcoal-muted leading-relaxed">
                Approving this case will set verification status to <strong>Approved</strong>, activate the campaign for public crowdfunding, send an in-app notification to the rescuer, and record your decision in the append-only audit trail.
              </p>

              {!allChecklistItemsChecked && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 text-amber-800 text-[11px] border border-amber-200">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Some verification checklist items are not marked as reviewed.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <OutlineButton
                  size="sm"
                  onClick={() => setShowApproveModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </OutlineButton>
                <PrimaryButton
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800"
                  isLoading={actionLoading}
                  onClick={handleApprove}
                >
                  Confirm & Approve
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal: Rejection */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-warm border border-grey-light space-y-4 font-sans animate-fade-in">
              <div className="flex items-center gap-3 text-rose-800">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-rose-700" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold">Confirm Rejection</h3>
                  <span className="text-xs text-charcoal-muted">Case Verification Action</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 text-xs space-y-1.5 text-rose-900">
                <div>
                  <strong>Case:</strong> {rescueCase.title}
                </div>
                <div>
                  <strong>Rejection Reason:</strong> {reviewNote.trim() || '<Reason Required>'}
                </div>
              </div>

              {!reviewNote.trim() && (
                <p className="text-xs text-rose-700 font-semibold">
                  A rejection reason is strictly required before rejecting this case. Please fill in the note field.
                </p>
              )}

              <p className="text-xs text-charcoal-muted leading-relaxed">
                Rejecting this case will keep it hidden from public exploration. The reason will be notified to the submitting rescuer and logged into the append-only audit trail.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <OutlineButton
                  size="sm"
                  onClick={() => setShowRejectModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </OutlineButton>
                <PrimaryButton
                  size="sm"
                  className="bg-rose-700 hover:bg-rose-800"
                  disabled={!reviewNote.trim()}
                  isLoading={actionLoading}
                  onClick={handleReject}
                >
                  Confirm Rejection
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
};

export default AdminCaseReviewPage;
