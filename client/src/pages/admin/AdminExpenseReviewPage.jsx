import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Calendar,
  FileText,
  User,
  Receipt,
  Download,
  Building2,
  Lock,
  Eye,
} from 'lucide-react';
import {
  getAdminExpenseById,
  approveAdminExpense,
  rejectAdminExpense,
} from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import FormTextarea from '../../components/forms/FormTextarea';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';

export const AdminExpenseReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);
  const [allocationContext, setAllocationContext] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  // Confirmation Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchExpense = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminExpenseById(id);
      if (data && data.success && data.expense) {
        setExpense(data.expense);
        setAllocationContext(data.allocationContext || null);
        if (data.expense.reviewNote) {
          setReviewNote(data.expense.reviewNote);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load expense details for review.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExpense();
  }, [fetchExpense]);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const res = await approveAdminExpense(id, reviewNote);
      setActionLoading(false);
      setShowApproveModal(false);
      if (res && res.success) {
        setActionMessage('Expense proof approved and verified spending updated in transparency ledger.');
        fetchExpense();
      }
    } catch (err) {
      setActionLoading(false);
      alert(err.message || 'Approval failed.');
    }
  };

  const handleReject = async () => {
    if (!reviewNote.trim()) {
      alert('Please provide a rejection reason before rejecting this expense proof.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await rejectAdminExpense(id, reviewNote);
      setActionLoading(false);
      setShowRejectModal(false);
      if (res && res.success) {
        setActionMessage('Expense claim rejected. The reason has been notified to the submitting rescuer.');
        fetchExpense();
      }
    } catch (err) {
      setActionLoading(false);
      alert(err.message || 'Rejection failed.');
    }
  };

  if (loading) {
    return (
      <Section spacing="default" className="py-20">
        <Container size="narrow">
          <LoadingState
            message="Loading expense proof dossier..."
            subtext="Retrieving hospital invoices, allocation records, and doctor billing proofs"
          />
        </Container>
      </Section>
    );
  }

  if (error || !expense) {
    return (
      <Section spacing="default" className="py-20">
        <Container size="narrow">
          <EmptyState
            icon={AlertCircle}
            title="Expense Record Unavailable"
            description={error || 'The requested expense claim could not be found.'}
            action={
              <Link to="/admin/expenses">
                <PrimaryButton icon={ArrowLeft}>
                  Return to Audit Queue
                </PrimaryButton>
              </Link>
            }
          />
        </Container>
      </Section>
    );
  }

  const isPending = expense.verificationStatus === 'Pending';
  const remainingAlloc = allocationContext?.remainingAllocBalance || 0;
  const isOverAlloc = isPending && expense.amount > remainingAlloc;

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container>
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/admin/expenses"
            className="inline-flex items-center text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Expense Queue
          </Link>
          <div className="flex items-center gap-3 text-xs font-mono text-charcoal-muted">
            <span>Claim ID: {expense._id}</span>
            <span>•</span>
            <span>Submitted: {new Date(expense.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action notification banner */}
        {actionMessage && (
          <div className="rounded-2xl p-4 mb-6 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Verification Status Alert */}
        {!isPending && (
          <div
            className={`rounded-2xl p-4 mb-6 border text-xs flex items-center justify-between gap-4 ${
              expense.verificationStatus === 'Approved'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/70 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {expense.verificationStatus === 'Approved' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <div>
                <strong>
                  This claim has been reviewed and marked as {expense.verificationStatus}.
                </strong>
                {expense.reviewedAt && (
                  <span className="block text-[11px] text-charcoal-muted mt-0.5">
                    Audited on {new Date(expense.reviewedAt).toLocaleString()} by{' '}
                    {expense.reviewedBy?.name || 'Administrator'}
                  </span>
                )}
              </div>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white border border-grey-light">
              Decision Finalized
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          {/* Main Claim Dossier */}
          <div className="lg:col-span-8 space-y-6">
            <BaseCard padding="lg" className="space-y-6 bg-white shadow-warm-xs border border-grey-light">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-grey-light pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-forest bg-forest-subtle px-2.5 py-0.5 rounded-full">
                    {expense.expenseCategory}
                  </span>
                  <span className="text-xs text-charcoal-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-sage-dark" />
                    Incurred on {new Date(expense.expenseDate).toLocaleDateString()}
                  </span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    expense.verificationStatus === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : expense.verificationStatus === 'Rejected'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Status: {expense.verificationStatus}
                </span>
              </div>

              {/* Title & Amount */}
              <div>
                <span className="text-[11px] text-charcoal-muted uppercase font-semibold block">
                  Expense Claim Title
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest mt-0.5">
                  {expense.title}
                </h1>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-bold text-forest">
                    ₹{expense.amount.toLocaleString()}
                  </span>
                  <span className="text-xs text-charcoal-muted">INR (Simulated Claim)</span>
                </div>
              </div>

              {/* Narrative & Treatment Details */}
              <div className="space-y-2 pt-2 border-t border-grey-light text-xs">
                <span className="font-semibold uppercase tracking-wider text-charcoal-muted block">
                  Clinical Narrative & Explanation
                </span>
                <p className="p-3.5 rounded-xl bg-ivory-warm/60 border border-grey-light leading-relaxed whitespace-pre-line text-charcoal">
                  {expense.description}
                </p>
              </div>

              {/* Document Proofs & Invoices */}
              <div className="space-y-3 pt-2 border-t border-grey-light">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted block">
                    Uploaded Supporting Proof Documents ({expense.proofDocuments?.length || 0})
                  </span>
                  <span className="text-[11px] text-charcoal-muted font-mono">
                    Protected Documents
                  </span>
                </div>

                {expense.documentDescription && (
                  <p className="text-xs text-charcoal-muted italic">
                    Invoice Details: {expense.documentDescription} ({expense.documentType})
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {expense.proofDocuments?.map((doc, idx) => {
                    const isImg = doc.mimeType?.startsWith('image/');
                    return (
                      <div
                        key={doc._id || idx}
                        className="p-3.5 rounded-xl bg-ivory-warm/70 border border-grey-light flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isImg ? (
                            <img
                              src={doc.documentUrl}
                              alt={doc.originalName}
                              className="w-12 h-12 rounded-lg object-cover border border-grey-light flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-forest/10 text-forest flex items-center justify-center flex-shrink-0">
                              <FileText className="w-6 h-6" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-semibold text-charcoal truncate block">
                              {doc.originalName}
                            </span>
                            <span className="text-[10px] text-charcoal-muted font-mono block">
                              {(doc.fileSize / 1024).toFixed(1)} KB • {doc.mimeType}
                            </span>
                          </div>
                        </div>

                        <a
                          href={doc.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-forest text-ivory text-xs font-semibold shadow-warm-xs hover:bg-forest-light transition-colors flex items-center gap-1.5 flex-shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </BaseCard>
          </div>

          {/* Right Sidebar: Allocation Context & Decision Action */}
          <div className="lg:col-span-4 space-y-6">
            {/* Allocation Context Card */}
            <BaseCard padding="md" className="space-y-3 bg-white shadow-warm-xs border border-grey-light">
              <div className="flex items-center gap-1.5 border-b border-grey-light pb-2 text-forest">
                <Building2 className="w-4 h-4 text-forest" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Linked Escrow Allocation
                </span>
              </div>

              {allocationContext ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Allocation Ref:</span>
                    <strong className="font-mono text-forest">
                      {expense.fundAllocation?.allocationReference}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Category:</span>
                    <span className="font-semibold">
                      {expense.fundAllocation?.allocationCategory}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Allocated Amount:</span>
                    <strong>₹{allocationContext.totalAllocated.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">Already Verified Spent:</span>
                    <span>₹{allocationContext.previouslyApprovedSpending.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-grey-light font-semibold">
                    <span className="text-charcoal">Available for this claim:</span>
                    <strong className="text-emerald-800 text-sm">
                      ₹{remainingAlloc.toLocaleString()}
                    </strong>
                  </div>
                </div>
              ) : null}

              {isOverAlloc && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-[11px] font-medium">
                  ⚠️ <strong>Insufficient Balance:</strong> This claim amount (₹{expense.amount.toLocaleString()}) exceeds the unspent allocation balance (₹{remainingAlloc.toLocaleString()}). It cannot be approved without adjusting allocations.
                </div>
              )}
            </BaseCard>

            {/* Submitting Rescuer Profile */}
            <BaseCard padding="md" className="space-y-3 bg-white shadow-warm-xs border border-grey-light">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted block border-b border-grey-light pb-2">
                Submitting Rescuer
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Rescuer Name:</span>
                  <strong className="text-charcoal">{expense.submittedBy?.name || 'Rescuer'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Email:</span>
                  <span className="font-mono">{expense.submittedBy?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Contact Phone:</span>
                  <span>{expense.submittedBy?.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Verification Status:</span>
                  <span className="capitalize font-semibold text-emerald-800">
                    {expense.submittedBy?.rescuerVerificationStatus || 'approved'}
                  </span>
                </div>
              </div>
            </BaseCard>

            {/* Admin Audit Action Card */}
            <BaseCard padding="lg" className="space-y-4 bg-white border-2 border-forest/20 shadow-warm">
              <div className="flex items-center gap-2 text-forest">
                <ShieldCheck className="w-5 h-5 text-forest" />
                <h3 className="font-serif text-lg font-bold">
                  Administrative Decision
                </h3>
              </div>

              <FormTextarea
                id="adminExpenseNote"
                label="Verification Note / Rejection Reason"
                placeholder="Enter hospital bill check notes or reason if rejecting..."
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
                  disabled={!isPending || isOverAlloc}
                  onClick={() => setShowApproveModal(true)}
                >
                  Approve Expense & Disburse
                </PrimaryButton>

                <OutlineButton
                  size="md"
                  icon={XCircle}
                  className="w-full text-rose-700 border-rose-200 hover:bg-rose-50"
                  disabled={!isPending}
                  onClick={() => setShowRejectModal(true)}
                >
                  Reject Expense
                </OutlineButton>
              </div>
            </BaseCard>
          </div>
        </div>

        {/* Confirmation Modal: Approval */}
        {showApproveModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-warm-lg border border-grey-light space-y-4 font-sans animate-fade-in">
              <div className="flex items-center gap-3 text-emerald-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold">Confirm Approval</h3>
                  <span className="text-xs text-charcoal-muted">Expense Audit Action</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-ivory-warm border border-grey-light text-xs space-y-1.5">
                <div>
                  <strong>Expense:</strong> {expense.title}
                </div>
                <div>
                  <strong>Amount:</strong> ₹{expense.amount.toLocaleString()}
                </div>
                <div>
                  <strong>Allocation:</strong> {expense.fundAllocation?.allocationReference} ({expense.fundAllocation?.allocationCategory})
                </div>
                {reviewNote && (
                  <div>
                    <strong>Audit Note:</strong> "{reviewNote}"
                  </div>
                )}
              </div>

              <p className="text-xs text-charcoal-muted leading-relaxed">
                Approving this claim will deduct <strong>₹{expense.amount.toLocaleString()}</strong> from the allocation balance, update verified spending on the transparency dashboard, and notify the rescuer.
              </p>

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
                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  isLoading={actionLoading}
                  onClick={handleApprove}
                >
                  Confirm & Approve Claim
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal: Rejection */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-warm-lg border border-grey-light space-y-4 font-sans animate-fade-in">
              <div className="flex items-center gap-3 text-rose-800">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-rose-700" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold">Confirm Rejection</h3>
                  <span className="text-xs text-charcoal-muted">Expense Audit Action</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 text-xs space-y-1.5 text-rose-900">
                <div>
                  <strong>Expense:</strong> {expense.title}
                </div>
                <div>
                  <strong>Rejection Reason:</strong> {reviewNote.trim() || '<Reason Required>'}
                </div>
              </div>

              {!reviewNote.trim() && (
                <p className="text-xs text-rose-700 font-semibold">
                  A rejection reason is strictly required before rejecting this expense claim.
                </p>
              )}

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
                  className="bg-rose-700 hover:bg-rose-800 text-white"
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

export default AdminExpenseReviewPage;
