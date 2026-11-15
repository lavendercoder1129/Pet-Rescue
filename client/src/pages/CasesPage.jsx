import { Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import Container from '../components/layout/Container';
import Section from '../components/layout/Section';
import PageHeader from '../components/layout/PageHeader';
import RescueCaseCard from '../components/cards/RescueCaseCard';
import { mockCases } from '../data/mockCases';

export const CasesPage = () => {
  return (
    <Section spacing="default">
      <Container>
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Home
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-grey-light">
          <PageHeader
            eyebrow="Emergency Directory"
            title="All Emergency Rescue Cases"
            subtitle="Browse verified stray animal medical emergencies awaiting simulated community support. Every case is triaged with physical clinic bills."
          />

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sage-wash text-forest border border-sage/40">
              <ShieldCheck className="w-3.5 h-3.5 text-forest" />
              {mockCases.length} Active Cases
            </span>
          </div>
        </div>

        {/* Academic Simulation Banner */}
        <div className="rounded-xl p-4 mb-8 bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-800 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Module 2 Showcase:</strong> Full search, filtering, and case submission workflows will be expanded in Module 3. All pledges below are simulated.
          </span>
        </div>

        {/* Grid of cases */}
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
              onDonate={() => alert(`Simulated contribution for ${c.name} recorded.`)}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default CasesPage;
