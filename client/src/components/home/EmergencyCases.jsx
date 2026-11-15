import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import Container from '../layout/Container';
import Section from '../layout/Section';
import PageHeader from '../layout/PageHeader';
import PrimaryButton from '../common/PrimaryButton';
import RescueCaseCard from '../cards/RescueCaseCard';
import { mockCases } from '../../data/mockCases';

export const EmergencyCases = () => {
  const [activeSimulationModal, setActiveSimulationModal] = useState(null);

  const handleSimulatedSupport = (rescueCase) => {
    setActiveSimulationModal(rescueCase);
  };

  return (
    <Section id="cases" spacing="default">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <PageHeader
            eyebrow="Emergency Triage"
            title="They Need Help Today."
            subtitle="Explore rescue cases that need immediate attention. Every case includes verified clinic invoices and direct veterinary tracking."
          />

          <Link to="/cases" className="flex-shrink-0">
            <PrimaryButton
              variant="outline"
              icon={ArrowRight}
              iconPosition="right"
              className="bg-forest text-ivory hover:bg-forest-light"
            >
              View All Emergency Cases
            </PrimaryButton>
          </Link>
        </div>

        {/* Campaign Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockCases.map((c) => (
            <RescueCaseCard
              key={c.id}
              id={c.id}
              title={c.title}
              animalType={c.animalType}
              location={c.location}
              injuryDescription={c.injuryDescription}
              urgency={c.urgency}
              currentAmount={c.currentAmount}
              targetAmount={c.targetAmount}
              donorCount={c.donorCount}
              image={c.image}
              fallbackImage={c.fallbackImage}
              onDonate={() => handleSimulatedSupport(c)}
            />
          ))}
        </div>

        {/* Academic Simulation Callout */}
        <div className="mt-10 rounded-2xl bg-ivory-warm/70 border border-grey-light p-4.5 flex items-center justify-between flex-wrap gap-4 text-xs text-charcoal-muted">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-muted flex-shrink-0" />
            <span>
              <strong>Academic Project Simulation:</strong> Cases shown above are realistic demonstration examples. Clicking support triggers simulated balance accounting only.
            </span>
          </div>

          <Link to="/transparency" className="text-forest font-semibold hover:underline flex items-center gap-1">
            Learn about our fund audit model <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Interactive Simulation Modal for Component Preview */}
        {activeSimulationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-warm-lg border border-grey-light space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-subtle text-orange-muted flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-forest">
                    Simulated Contribution
                  </h3>
                  <span className="text-xs text-charcoal-muted">
                    Case: {activeSimulationModal.name}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-ivory-warm text-xs space-y-2 text-charcoal-muted">
                <p>
                  You are supporting <strong>{activeSimulationModal.title}</strong> with a simulated pledge of <strong>₹500</strong>.
                </p>
                <p className="text-[11px] text-amber-800">
                  ⚠️ No actual payment gateway (Razorpay/UPI) is invoked. Full simulated escrow workflow will be implemented in Module 4.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSimulationModal(null)}
                  className="px-4 py-2 text-sm font-medium text-charcoal-muted hover:text-forest"
                >
                  Close
                </button>
                <PrimaryButton
                  size="sm"
                  onClick={() => {
                    alert(`Simulated ₹500 pledge for ${activeSimulationModal.name} registered successfully!`);
                    setActiveSimulationModal(null);
                  }}
                >
                  Confirm Simulated Pledge
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
};

export default EmergencyCases;
