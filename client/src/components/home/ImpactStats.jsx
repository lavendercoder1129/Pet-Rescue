import { Activity, AlertCircle, HeartHandshake, ShieldCheck } from 'lucide-react';
import Container from '../layout/Container';
import Section from '../layout/Section';
import StatCard from '../cards/StatCard';
import { mockImpactStats } from '../../data/mockCases';

export const ImpactStats = () => {
  const iconMap = {
    'Animals Rescued': Activity,
    'Active Rescue Cases': AlertCircle,
    'Supporters': HeartHandshake,
    'Funds Tracked': ShieldCheck,
  };

  return (
    <Section spacing="sm" variant="warm">
      <Container>
        <div className="space-y-4 text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-semibold tracking-widest text-orange-muted uppercase font-sans">
            Demonstration Metrics
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
            Simulated Community Impact
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
            *Notice: The figures below are simulated academic-project demonstration values representing platform capabilities, not verified real-world rescue tallies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mockImpactStats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={iconMap[stat.title] || Activity}
              colorScheme={stat.colorScheme}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default ImpactStats;
