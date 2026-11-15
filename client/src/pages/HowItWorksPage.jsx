import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Container from '../components/layout/Container';
import Section from '../components/layout/Section';
import PageHeader from '../components/layout/PageHeader';
import PrimaryButton from '../components/common/PrimaryButton';
import BaseCard from '../components/cards/BaseCard';

export const HowItWorksPage = () => {
  return (
    <Section spacing="default">
      <Container>
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Home
          </Link>
        </div>

        <div className="mb-12 pb-6 border-b border-grey-light">
          <PageHeader
            eyebrow="Workflow Guide"
            title="How Pet Rescue Coordinates Stray Animal Care"
            subtitle="An end-to-end walkthrough of emergency triage, medical estimate verification, simulated escrow funding, and post-surgery discharge."
          />
        </div>

        <div className="space-y-8 max-w-4xl">
          <BaseCard padding="lg" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest text-ivory flex items-center justify-center font-serif font-bold text-lg">
                1
              </div>
              <h3 className="font-serif text-2xl font-bold text-forest">
                Rescuer Intake & On-Ground Reporting
              </h3>
            </div>
            <p className="text-sm text-charcoal-muted leading-relaxed font-sans">
              When an injured or critically sick stray animal is spotted, rescuers create a report specifying location, animal condition, visual injury proofs, and admitting veterinary clinic details.
            </p>
          </BaseCard>

          <BaseCard padding="lg" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-muted text-white flex items-center justify-center font-serif font-bold text-lg">
                2
              </div>
              <h3 className="font-serif text-2xl font-bold text-forest">
                Administrative Verification & Triage
              </h3>
            </div>
            <p className="text-sm text-charcoal-muted leading-relaxed font-sans">
              Platform admins contact the treating veterinary doctor to verify the diagnosis, estimated surgical expenses, and urgency tier (Critical, Urgent, or Normal) before publishing the campaign.
            </p>
          </BaseCard>

          <BaseCard padding="lg" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage-dark text-white flex items-center justify-center font-serif font-bold text-lg">
                3
              </div>
              <h3 className="font-serif text-2xl font-bold text-forest">
                Simulated Community Funding & Escrow
              </h3>
            </div>
            <p className="text-sm text-charcoal-muted leading-relaxed font-sans">
              Donors pledge simulated contributions toward the target goal. Funds are held in escrow and disbursed directly against uploaded pharmacy and clinic invoices with zero transaction fees.
            </p>
          </BaseCard>

          <BaseCard padding="lg" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-deep text-white flex items-center justify-center font-serif font-bold text-lg">
                4
              </div>
              <h3 className="font-serif text-2xl font-bold text-forest">
                Recovery Updates & Public Transparency
              </h3>
            </div>
            <p className="text-sm text-charcoal-muted leading-relaxed font-sans">
              Donors and community supporters receive recovery photos, clinical discharge notes, and foster transition updates on the public case page.
            </p>
          </BaseCard>

          <div className="pt-4 flex items-center justify-between">
            <Link to="/cases">
              <PrimaryButton icon={ArrowRight} iconPosition="right">
                Explore Active Emergency Cases
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default HowItWorksPage;
