import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import {
  getAdminCaseById,
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
  const [reviewNote, setReviewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const fetchCase = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminCaseById(id);
      if (data && data.success && data.case) {
        setRescueCase(data.case);
        if (data.case.reviewNote) {
          setReviewNote(data.case.reviewNote);
        }
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

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const res = await approveAdminCase(id, reviewNote);
      setActionLoading(false);
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
      alert('Please provide a review note / reason before rejecting this case.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await rejectAdminCase(id, reviewNote);
      setActionLoading(false);
      if (res && res.success) {
        setActionMessage('Case has been rejected. It will not be visible publicly.');
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
              subtext="Retrieving medical diagnosis and uploaded photographic proofs"
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

  const images = rescueCase.images && rescueCase.images.length > 0
    ? rescueCase.images.map((img) => (img.startsWith('http') ? img : `http://localhost:5000${img}`))
    : ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80'];

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container>
        {/* Back navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/admin/cases"
            className="inline-flex items-center text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Review Queue
          </Link>

          <span className="text-xs font-mono text-charcoal-muted">Case ID: {rescueCase._id}</span>
        </div>

        {/* Action notification banner */}
        {actionMessage && (
          <div className="rounded-xl p-4 mb-6 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Dossier Column */}
          <div className="lg:col-span-8 space-y-6">
            <BaseCard padding="lg" className="space-y-6 bg-white shadow-warm-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-grey-light pb-4">
                <div className="flex items-center gap-2.5">
                  <UrgencyBadge level={rescueCase.urgencyLevel.toLowerCase()} />
                  <span className="text-xs font-semibold uppercase text-forest bg-forest-subtle px-2.5 py-0.5 rounded-full">
                    {rescueCase.animalType}
                  </span>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  rescueCase.verificationStatus === 'Approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : rescueCase.verificationStatus === 'Rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  Status: {rescueCase.verificationStatus}
                </span>
              </div>

              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest">
                  {rescueCase.title}
                </h1>
                <p className="text-xs text-charcoal-muted mt-1">
                  Patient: <strong className="text-charcoal">{rescueCase.animalName}</strong> ({rescueCase.breed}, {rescueCase.age}, {rescueCase.gender})
                </p>
              </div>

              {/* Photos Gallery */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted block">
                  Uploaded Injury & Animal Photographs
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl overflow-hidden border border-grey-light aspect-[4/3] bg-ivory-warm"
                    >
                      <img
                        src={imgUrl}
                        alt={`Case proof ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Narrative & Location */}
              <div className="space-y-2 pt-2 border-t border-grey-light">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted block">
                  Rescue Location & Landmark
                </span>
                <div className="flex items-start gap-2 text-xs text-charcoal bg-ivory-warm p-3 rounded-xl border border-grey-light">
                  <MapPin className="w-4 h-4 text-sage-dark flex-shrink-0 mt-0.5" />
                  <span>{rescueCase.location}</span>
                </div>
              </div>

              {/* Clinical Description */}
              <div className="space-y-3 pt-2 border-t border-grey-light">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted block">
                  Trauma & Medical Findings
                </span>
                <div className="p-4 rounded-xl bg-ivory-warm border border-grey-light space-y-2 text-xs">
                  <div>
                    <strong>Injury Type:</strong> {rescueCase.injuryType}
                  </div>
                  <div>
                    <strong>Trauma Details:</strong> {rescueCase.injuryDescription}
                  </div>
                  <div>
                    <strong>Attending Clinic Treatment:</strong> {rescueCase.medicalCondition}
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>

          {/* Right Sidebar: Rescuer & Decision Panel */}
          <div className="lg:col-span-4 space-y-6">
            {/* Rescuer Card */}
            <BaseCard padding="md" className="space-y-3 bg-white">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted block border-b border-grey-light pb-2">
                Submitting Rescuer Profile
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Rescuer:</span>
                  <strong className="text-charcoal">{rescueCase.createdBy?.name || 'Unknown'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Email:</span>
                  <span className="font-mono">{rescueCase.createdBy?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Phone:</span>
                  <span>{rescueCase.createdBy?.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Rescuer Status:</span>
                  <span className="capitalize font-semibold text-forest">
                    {rescueCase.createdBy?.rescuerVerificationStatus || 'approved'}
                  </span>
                </div>
              </div>
            </BaseCard>

            {/* Campaign Financial Estimates */}
            <BaseCard padding="md" className="space-y-3 bg-white">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted block border-b border-grey-light pb-2">
                Simulated Financial Target
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Treatment Estimate:</span>
                  <strong className="text-charcoal">₹{rescueCase.estimatedTreatmentCost.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-muted">Fundraising Goal:</span>
                  <strong className="font-serif text-base text-forest">
                    ₹{rescueCase.fundraisingGoal.toLocaleString()}
                  </strong>
                </div>
              </div>
            </BaseCard>

            {/* Admin Decision Action Card */}
            <BaseCard padding="lg" className="space-y-4 bg-white border-2 border-forest/20 shadow-warm">
              <div className="flex items-center gap-2 text-forest">
                <ShieldCheck className="w-5 h-5 text-forest" />
                <h3 className="font-serif text-lg font-bold">
                  Administrative Decision
                </h3>
              </div>

              <FormTextarea
                id="adminReviewNote"
                label="Verification Note / Rejection Reason"
                placeholder="Enter doctor verification details, invoice check, or reason if rejecting..."
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                helperText="Required if rejecting. Visible to submitting rescuer and public on verified cases."
              />

              <div className="space-y-2 pt-2">
                <PrimaryButton
                  size="md"
                  icon={CheckCircle2}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                  isLoading={actionLoading}
                  onClick={handleApprove}
                >
                  Approve Case & Activate Campaign
                </PrimaryButton>

                <OutlineButton
                  size="md"
                  icon={XCircle}
                  className="w-full text-rose-700 border-rose-200 hover:bg-rose-50"
                  isLoading={actionLoading}
                  onClick={handleReject}
                >
                  Reject Case
                </OutlineButton>
              </div>
            </BaseCard>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default AdminCaseReviewPage;
