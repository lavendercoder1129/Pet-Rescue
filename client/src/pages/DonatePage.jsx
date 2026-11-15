import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, AlertCircle } from 'lucide-react';
import Container from '../components/layout/Container';
import Section from '../components/layout/Section';
import BaseCard from '../components/cards/BaseCard';
import PrimaryButton from '../components/common/PrimaryButton';

export const DonatePage = () => {
  const { caseId } = useParams();

  return (
    <Section spacing="default" className="py-12 sm:py-20">
      <Container size="narrow">
        <div className="mb-6">
          <Link
            to={caseId ? `/cases/${caseId}` : '/cases'}
            className="inline-flex items-center text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Case Details
          </Link>
        </div>

        <BaseCard padding="lg" className="space-y-6 text-center shadow-warm-lg bg-white">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-subtle text-orange-muted flex items-center justify-center shadow-warm-sm">
            <Heart className="w-8 h-8 fill-orange-muted" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-muted font-sans">
              Module 6 Milestone Preview
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Simulated Donation Platform
            </h1>
            <p className="text-sm text-charcoal-muted font-sans leading-relaxed max-w-md mx-auto">
              You are supporting case ref: <code className="font-mono text-forest bg-forest-subtle px-2 py-0.5 rounded">{caseId || 'Emergency'}</code>.
            </p>
          </div>

          {/* Academic Simulation Notice */}
          <div className="rounded-xl p-4.5 bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-semibold block">Academic Simulation Notice:</strong>
              <p>
                As required by project specifications, Pet Rescue does not integrate live commercial payment gateways, UPI handlers, or banking APIs.
              </p>
              <p className="text-amber-800/80 text-[11px]">
                Full simulated escrow workflows, wallet balance adjustments, and transparency ledger updates will be implemented in Module 6 (Simulated Donation System).
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={`/cases/${caseId}`}>
              <PrimaryButton icon={ArrowLeft}>
                Return to Rescue Case
              </PrimaryButton>
            </Link>
            <Link to="/transparency">
              <span className="text-xs font-semibold text-forest hover:underline">
                View Fund Transparency Model
              </span>
            </Link>
          </div>
        </BaseCard>
      </Container>
    </Section>
  );
};

export default DonatePage;
