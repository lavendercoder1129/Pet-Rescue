import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Heart, ShieldCheck, Building2 } from 'lucide-react';
import Container from '../components/layout/Container';
import Section from '../components/layout/Section';
import PageHeader from '../components/layout/PageHeader';
import PrimaryButton from '../components/common/PrimaryButton';
import UrgencyBadge from '../components/feedback/UrgencyBadge';
import ProgressBar from '../components/feedback/ProgressBar';
import BaseCard from '../components/cards/BaseCard';
import { mockCases } from '../data/mockCases';

export const CaseDetailPage = () => {
  const { id } = useParams();
  const rescueCase = mockCases.find((c) => c.id === id || c.slug === id) || mockCases[0];

  const percentage = Math.round((rescueCase.currentAmount / (rescueCase.targetAmount || 1)) * 100);

  return (
    <Section spacing="default">
      <Container>
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Link to="/cases" className="inline-flex items-center text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Emergency Cases
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Case Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header info */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <UrgencyBadge level={rescueCase.urgency} />
                <span className="text-xs text-charcoal-muted flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sage-dark" />
                  {rescueCase.location}
                </span>
                <span className="text-xs text-charcoal-muted flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sage-dark" />
                  Admitted: {rescueCase.admissionDate}
                </span>
              </div>

              <PageHeader
                title={rescueCase.title}
                subtitle={rescueCase.summary}
              />
            </div>

            {/* Featured Image Frame */}
            <div className="rounded-3xl overflow-hidden border border-grey-light shadow-warm bg-ivory-warm aspect-[16/10]">
              <img
                src={rescueCase.image}
                alt={rescueCase.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = rescueCase.fallbackImage;
                }}
              />
            </div>

            {/* Clinical & Triage Details */}
            <BaseCard padding="lg" className="space-y-4">
              <h3 className="font-serif text-2xl font-bold text-forest">
                Clinical Examination & Injury Report
              </h3>
              <p className="text-sm text-charcoal-soft font-sans leading-relaxed">
                {rescueCase.injuryDescription}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-grey-light">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase text-charcoal-muted">Admitting Hospital</span>
                  <div className="flex items-center gap-2 text-sm font-medium text-forest">
                    <Building2 className="w-4 h-4 text-sage-dark" />
                    <span>{rescueCase.veterinaryClinic}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase text-charcoal-muted">Verification Status</span>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Prescription & Stamped Invoice Verified</span>
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>

          {/* Right Sidebar: Simulated Funding Progress */}
          <div className="lg:col-span-4 space-y-6">
            <BaseCard padding="lg" className="space-y-6 sticky top-24">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  Simulated Campaign
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="font-serif text-3xl font-bold text-forest">
                    ₹{rescueCase.currentAmount.toLocaleString()}
                  </span>
                  <span className="text-xs text-charcoal-muted">
                    goal of ₹{rescueCase.targetAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <ProgressBar
                value={rescueCase.currentAmount}
                max={rescueCase.targetAmount}
                showLabels
                label="Funding Progress"
                valueText={`${percentage}%`}
                size="md"
              />

              <div className="text-xs text-charcoal-muted space-y-1 bg-ivory-warm p-3 rounded-xl border border-grey-light">
                <div className="flex justify-between">
                  <span>Simulated Supporters:</span>
                  <strong className="text-charcoal">{rescueCase.donorCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Current Patient Status:</span>
                  <strong className="text-forest">{rescueCase.status}</strong>
                </div>
              </div>

              <div className="space-y-2">
                <PrimaryButton
                  icon={Heart}
                  size="lg"
                  className="w-full bg-orange-muted hover:bg-orange-hover text-white"
                  onClick={() => alert(`Simulated contribution for ${rescueCase.name} pledged successfully!`)}
                >
                  Support This Rescue
                </PrimaryButton>

                <p className="text-[11px] text-center text-charcoal-muted">
                  ⚠️ Academic simulation: No real monetary payment processed.
                </p>
              </div>
            </BaseCard>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default CaseDetailPage;
