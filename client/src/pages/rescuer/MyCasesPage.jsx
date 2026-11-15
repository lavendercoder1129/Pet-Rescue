import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Eye,
  RefreshCw,
  AlertCircle,
  MapPin,
  Calendar,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { getMyCases, resubmitRescueCase } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import FormInput from '../../components/forms/FormInput';
import FormTextarea from '../../components/forms/FormTextarea';
import UrgencyBadge from '../../components/feedback/UrgencyBadge';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';

export const MyCasesPage = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Resubmission modal state
  const [resubmittingCase, setResubmittingCase] = useState(null);
  const [resubmitFormData, setResubmitFormData] = useState({
    title: '',
    animalName: '',
    location: '',
    description: '',
    injuryType: '',
    injuryDescription: '',
    medicalCondition: '',
    estimatedTreatmentCost: '',
    fundraisingGoal: '',
  });
  const [resubmitLoading, setResubmitLoading] = useState(false);
  const [resubmitMessage, setResubmitMessage] = useState('');

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

  const openResubmitModal = (c) => {
    setResubmittingCase(c);
    setResubmitFormData({
      title: c.title || '',
      animalName: c.animalName || '',
      location: c.location || '',
      description: c.description || '',
      injuryType: c.injuryType || '',
      injuryDescription: c.injuryDescription || '',
      medicalCondition: c.medicalCondition || '',
      estimatedTreatmentCost: c.estimatedTreatmentCost || '',
      fundraisingGoal: c.fundraisingGoal || '',
    });
    setResubmitMessage('');
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    if (!resubmittingCase) return;

    try {
      setResubmitLoading(true);
      const res = await resubmitRescueCase(resubmittingCase._id, resubmitFormData);
      setResubmitLoading(false);
      if (res && res.success) {
        setResubmittingCase(null);
        setResubmitMessage('Case updated and successfully queued back for admin re-review.');
        fetchCases();
      }
    } catch (err) {
      setResubmitLoading(false);
      alert(err.message || 'Failed to resubmit case.');
    }
  };

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
              Track verification status, review administrative feedback, and revise rejected cases for re-review.
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

        {/* Global Action Message */}
        {resubmitMessage && (
          <div className="rounded-xl p-4 mb-6 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>{resubmitMessage}</span>
          </div>
        )}

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

              const isRejected = c.verificationStatus === 'Rejected';
              const isApprovedCase = c.verificationStatus === 'Approved';

              return (
                <BaseCard key={c._id} padding="md" className="space-y-4 bg-white shadow-warm-xs">
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
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                              isApprovedCase
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : isRejected
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
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
                            Submitted: {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                          {c.reviewedAt && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-mono text-[11px]">
                                Reviewed: {new Date(c.reviewedAt).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right financial & actions */}
                    <div className="flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-grey-light">
                      <div className="text-right">
                        <span className="text-xs text-charcoal-muted block">Simulated Goal</span>
                        <span className="font-serif font-bold text-forest text-lg">
                          ₹{c.amountCollected.toLocaleString()} / ₹{c.fundraisingGoal.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isApprovedCase ? (
                          <Link to={`/cases/${c._id}`}>
                            <OutlineButton size="sm" icon={Eye}>
                              View Public Page
                            </OutlineButton>
                          </Link>
                        ) : isRejected ? (
                          <PrimaryButton
                            size="sm"
                            icon={RotateCcw}
                            className="bg-forest text-xs"
                            onClick={() => openResubmitModal(c)}
                          >
                            Revise & Resubmit
                          </PrimaryButton>
                        ) : (
                          <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 font-medium">
                            In Admin Verification Queue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Admin review note & rejection feedback */}
                  {(c.reviewNote || c.rejectionReason) && (
                    <div
                      className={`p-3.5 rounded-xl text-xs space-y-1 ${
                        isApprovedCase
                          ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-900'
                          : 'bg-rose-50/80 border border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold">
                        {isApprovedCase ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-700" />
                        )}
                        <span>
                          {isApprovedCase ? 'Admin Review Note:' : 'Rejection Reason & Required Corrections:'}
                        </span>
                      </div>
                      <p className="leading-relaxed pl-5 font-sans">
                        {c.rejectionReason || c.reviewNote}
                      </p>
                      {isRejected && (
                        <p className="text-[11px] text-rose-800 font-medium pl-5 pt-1">
                          Action Required: Click "Revise & Resubmit" to update the medical diagnosis, missing photographs, or treatment estimate to return this case for review.
                        </p>
                      )}
                    </div>
                  )}
                </BaseCard>
              );
            })}
          </div>
        )}

        {/* Resubmission Modal */}
        {resubmittingCase && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-warm border border-grey-light space-y-4 font-sans my-8">
              <div className="flex items-center justify-between border-b border-grey-light pb-3">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-forest" />
                  <h3 className="font-serif text-lg font-bold text-forest">
                    Revise & Resubmit Case
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setResubmittingCase(null)}
                  className="p-1 rounded-lg hover:bg-grey-light text-charcoal-muted"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Display original rejection reason as guidance */}
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
                <strong>Admin Rejection Feedback:</strong>
                <p className="mt-1">{resubmittingCase.rejectionReason || resubmittingCase.reviewNote}</p>
              </div>

              <form onSubmit={handleResubmit} className="space-y-4 text-xs">
                <FormInput
                  label="Case Title"
                  value={resubmitFormData.title}
                  onChange={(e) =>
                    setResubmitFormData({ ...resubmitFormData, title: e.target.value })
                  }
                  required
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label="Animal Name"
                    value={resubmitFormData.animalName}
                    onChange={(e) =>
                      setResubmitFormData({ ...resubmitFormData, animalName: e.target.value })
                    }
                    required
                  />
                  <FormInput
                    label="Location & Landmark"
                    value={resubmitFormData.location}
                    onChange={(e) =>
                      setResubmitFormData({ ...resubmitFormData, location: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label="Estimated Treatment Cost (₹)"
                    type="number"
                    value={resubmitFormData.estimatedTreatmentCost}
                    onChange={(e) =>
                      setResubmitFormData({
                        ...resubmitFormData,
                        estimatedTreatmentCost: e.target.value,
                      })
                    }
                    required
                  />
                  <FormInput
                    label="Fundraising Goal (₹)"
                    type="number"
                    value={resubmitFormData.fundraisingGoal}
                    onChange={(e) =>
                      setResubmitFormData({ ...resubmitFormData, fundraisingGoal: e.target.value })
                    }
                    required
                  />
                </div>

                <FormTextarea
                  label="Trauma & Injury Description"
                  rows={2}
                  value={resubmitFormData.injuryDescription}
                  onChange={(e) =>
                    setResubmitFormData({
                      ...resubmitFormData,
                      injuryDescription: e.target.value,
                    })
                  }
                  required
                />

                <FormTextarea
                  label="Attending Clinic & Medical Condition"
                  rows={2}
                  value={resubmitFormData.medicalCondition}
                  onChange={(e) =>
                    setResubmitFormData({
                      ...resubmitFormData,
                      medicalCondition: e.target.value,
                    })
                  }
                  required
                />

                <p className="text-[11px] text-charcoal-muted leading-relaxed">
                  Submitting will return this case to <strong>Pending</strong> status in the admin review queue and log your updates in the append-only audit trail. You cannot change verification status directly.
                </p>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-grey-light">
                  <OutlineButton
                    size="sm"
                    type="button"
                    onClick={() => setResubmittingCase(null)}
                    disabled={resubmitLoading}
                  >
                    Cancel
                  </OutlineButton>
                  <PrimaryButton size="sm" type="submit" isLoading={resubmitLoading}>
                    Resubmit for Verification
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
};

export default MyCasesPage;
