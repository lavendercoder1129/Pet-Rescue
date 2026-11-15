import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, Award } from 'lucide-react';
import Container from '../components/layout/Container';
import Section from '../components/layout/Section';
import PageHeader from '../components/layout/PageHeader';
import BaseCard from '../components/cards/BaseCard';

export const DonorWallPage = () => {
  const sampleDonors = [
    { name: 'Dr. Ramesh Kumar', casesCount: 6, tier: 'Guardian Patron', badgeColor: 'bg-forest text-ivory' },
    { name: 'Pooja Venkatesh', casesCount: 4, tier: 'Rescue Champion', badgeColor: 'bg-orange-muted text-white' },
    { name: 'Nikhil & Simran', casesCount: 3, tier: 'Compassionate Supporter', badgeColor: 'bg-sage-dark text-white' },
    { name: 'Meera Deshmukh', casesCount: 2, tier: 'Community Friend', badgeColor: 'bg-forest-subtle text-forest' },
    { name: 'Arjun Sen', casesCount: 2, tier: 'Community Friend', badgeColor: 'bg-forest-subtle text-forest' },
    { name: 'Anonymous Ally', casesCount: 5, tier: 'Guardian Patron', badgeColor: 'bg-forest text-ivory' },
  ];

  return (
    <Section spacing="default">
      <Container>
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Home
          </Link>
        </div>

        <div className="mb-10 pb-6 border-b border-grey-light">
          <PageHeader
            eyebrow="Community Recognition"
            title="Supporter & Donor Wall"
            subtitle="Celebrating community members who pledge simulated medical care funding for vulnerable stray animals."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleDonors.map((donor, idx) => (
            <BaseCard key={idx} padding="md" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-forest-subtle flex items-center justify-center text-forest font-serif font-bold text-lg">
                  {donor.name.charAt(0)}
                </div>
                <span className={`text-[11px] font-semibold uppercase px-2.5 py-1 rounded-full ${donor.badgeColor}`}>
                  {donor.tier}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-forest">{donor.name}</h3>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  Supported {donor.casesCount} emergency stray rescue cases
                </p>
              </div>

              <div className="pt-2 border-t border-grey-light/60 flex items-center justify-between text-xs text-charcoal-muted">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-sage-dark" /> Verified Pledges
                </span>
                <span className="flex items-center gap-1 text-orange-muted font-medium">
                  <Heart className="w-3.5 h-3.5 fill-orange-muted" /> Active Ally
                </span>
              </div>
            </BaseCard>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default DonorWallPage;
