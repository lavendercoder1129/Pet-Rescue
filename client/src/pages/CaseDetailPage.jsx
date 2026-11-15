import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Heart,
  ShieldCheck,
  AlertCircle,
  User,
} from 'lucide-react';
import { getPublicCaseById } from '../services/api';
import Container from '../components/layout/Container';
import Section from '../components/layout/Section';
import BaseCard from '../components/cards/BaseCard';
import PrimaryButton from '../components/common/PrimaryButton';
import UrgencyBadge from '../components/feedback/UrgencyBadge';
import ProgressBar from '../components/feedback/ProgressBar';
import LoadingState from '../components/feedback/LoadingState';
import EmptyState from '../components/feedback/EmptyState';

export const CaseDetailPage = () => {
  const { id } = useParams();

  const [rescueCase, setRescueCase] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPublicCaseById(id);
        if (data && data.success && data.case) {
          setRescueCase(data.case);
        } else {
          setError('Rescue case not found or not publicly accessible.');
        }
      } catch (err) {
        setError(err.message || 'Rescue case not found or is currently pending administrative review.');
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id]);

  if (loading) {
    return (
      <Section spacing="default">
        <Container>
          <div className="py-24">
            <LoadingState
              message="Loading case dossier..."
              subtext="Retrieving clinical records and audited expenditure progress"
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
          <div className="py-16">
            <EmptyState
              icon={AlertCircle}
              title="Case Unavailable or Not Found"
              description={error || 'This rescue case does not exist or has not been approved for public crowdfunding yet.'}
              action={
                <Link to="/cases">
                  <PrimaryButton icon={ArrowLeft}>
                    Browse Verified Emergency Cases
                  </PrimaryButton>
                </Link>
              }
            />
          </div>
        </Container>
      </Section>
    );
  }

  const images = rescueCase.images && rescueCase.images.length > 0
    ? rescueCase.images.map((img) => (img.startsWith('http') ? img : `http://localhost:5000${img}`))
    : ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80'];

  const currentImage = images[activeImageIndex] || images[0];
  const percentage = Math.min(
    100,
    Math.round((rescueCase.amountCollected / (rescueCase.fundraisingGoal || 1)) * 100)
  );
  const remaining = Math.max(0, rescueCase.fundraisingGoal - rescueCase.amountCollected);

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container>
        {/* Back navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/cases"
            className="inline-flex items-center text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Emergency Cases
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-charcoal-muted">Case ID: {rescueCase._id}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header section */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <UrgencyBadge level={rescueCase.urgencyLevel.toLowerCase()} />
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-forest-subtle text-forest">
                  {rescueCase.animalType} ({rescueCase.breed})
                </span>
                <span className="text-xs text-charcoal-muted flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sage-dark" />
                  {rescueCase.location}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-forest leading-tight">
                {rescueCase.title}
              </h1>

              <div className="flex items-center gap-4 text-xs text-charcoal-muted pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sage-dark" />
                  Reported on {new Date(rescueCase.createdAt).toLocaleDateString()}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Verified on {new Date(rescueCase.reviewedAt || rescueCase.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Gallery Section */}
            <div className="space-y-3">
              <div className="rounded-3xl overflow-hidden border border-grey-light shadow-warm bg-ivory-warm aspect-[16/10] relative">
                <img
                  src={currentImage}
                  alt={rescueCase.animalName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-serif font-bold text-forest shadow-warm-sm">
                  Patient: {rescueCase.animalName}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-20 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImageIndex === idx
                          ? 'border-forest ring-2 ring-forest/20 scale-105'
                          : 'border-grey-light opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Comprehensive Information Cards */}
            <BaseCard padding="lg" className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-bold text-forest">
                  Case Overview & Incident Narrative
                </h3>
                <p className="text-sm text-charcoal-soft font-sans leading-relaxed whitespace-pre-line">
                  {rescueCase.description}
                </p>
              </div>

              <div className="pt-6 border-t border-grey-light space-y-4">
                <h3 className="font-serif text-xl font-bold text-forest">
                  Clinical Examination & Diagnostic Findings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-ivory-warm border border-grey-light space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">
                      Injury Classification
                    </span>
                    <div className="font-serif font-bold text-base text-forest">
                      {rescueCase.injuryType}
                    </div>
                    <p className="text-xs text-charcoal-muted leading-relaxed">
                      {rescueCase.injuryDescription}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-ivory-warm border border-grey-light space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">
                      Current Treatment Protocol
                    </span>
                    <div className="font-serif font-bold text-base text-forest">
                      Admitted Care
                    </div>
                    <p className="text-xs text-charcoal-muted leading-relaxed">
                      {rescueCase.medicalCondition}
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Profile Specs */}
              <div className="pt-6 border-t border-grey-light">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted mb-3">
                  Patient Profile Specs
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-grey-light">
                    <span className="text-charcoal-muted block">Animal Type:</span>
                    <span className="font-semibold text-charcoal">{rescueCase.animalType}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-grey-light">
                    <span className="text-charcoal-muted block">Estimated Age:</span>
                    <span className="font-semibold text-charcoal">{rescueCase.age || 'Unknown'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-grey-light">
                    <span className="text-charcoal-muted block">Gender:</span>
                    <span className="font-semibold text-charcoal">{rescueCase.gender || 'Unknown'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-grey-light">
                    <span className="text-charcoal-muted block">Verification:</span>
                    <span className="font-semibold text-emerald-800">100% Stamped</span>
                  </div>
                </div>
              </div>

              {/* Rescuer & Attending Info */}
              {rescueCase.createdBy && (
                <div className="pt-6 border-t border-grey-light flex items-center justify-between text-xs text-charcoal-muted">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-sage-dark" />
                    <span>Reported by: <strong>{rescueCase.createdBy.name}</strong> (Verified Rescuer)</span>
                  </div>
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Clinical Escrow Active
                  </span>
                </div>
              )}
            </BaseCard>
          </div>

          {/* Right Sidebar: Campaign Crowdfunding Progress */}
          <div className="lg:col-span-4 space-y-6">
            <BaseCard padding="lg" className="space-y-6 sticky top-24 shadow-warm-lg bg-white">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-muted font-sans">
                  Simulated Emergency Fund
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <div>
                    <span className="font-serif text-3xl sm:text-4xl font-bold text-forest">
                      ₹{rescueCase.amountCollected.toLocaleString()}
                    </span>
                    <span className="text-xs text-charcoal-muted ml-1">raised</span>
                  </div>
                  <span className="font-bold text-forest text-lg">{percentage}%</span>
                </div>
                <div className="text-xs text-charcoal-muted mt-1">
                  goal of ₹{rescueCase.fundraisingGoal.toLocaleString()} • ₹{remaining.toLocaleString()} remaining
                </div>
              </div>

              <ProgressBar
                value={rescueCase.amountCollected}
                max={rescueCase.fundraisingGoal}
                variant={percentage >= 100 ? 'emerald' : 'orange'}
                size="md"
              />

              <div className="p-4 rounded-xl bg-ivory-warm border border-grey-light text-xs text-charcoal-muted space-y-2">
                <div className="flex justify-between">
                  <span>Estimated Total Surgery Cost:</span>
                  <strong className="text-charcoal">₹{rescueCase.estimatedTreatmentCost.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Audit Verification Status:</span>
                  <strong className="text-emerald-800">Approved by Admin</strong>
                </div>
                <div className="flex justify-between">
                  <span>Campaign State:</span>
                  <strong className="text-forest">{rescueCase.campaignStatus}</strong>
                </div>
              </div>

              <div className="space-y-2.5">
                <Link to={`/donate/${rescueCase._id}`} className="block">
                  <PrimaryButton
                    size="lg"
                    icon={Heart}
                    className="w-full bg-orange-muted hover:bg-orange-hover text-white shadow-warm"
                  >
                    Support This Rescue
                  </PrimaryButton>
                </Link>

                <p className="text-[11px] text-center text-charcoal-muted leading-relaxed">
                  ⚠️ <strong>Academic Simulation Notice:</strong> Clicking support will navigate to the simulated contribution flow. No live payment gateways (UPI, Stripe, Razorpay) are connected.
                </p>
              </div>

              {rescueCase.reviewNote && (
                <div className="p-3.5 rounded-xl bg-sage-wash/60 border border-sage/40 text-xs text-forest">
                  <strong className="block mb-1 font-semibold">Admin Verification Note:</strong>
                  <p className="text-[11px] leading-relaxed opacity-90">{rescueCase.reviewNote}</p>
                </div>
              )}
            </BaseCard>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default CaseDetailPage;
