import { Search, Heart, ShieldCheck, ArrowRight } from 'lucide-react';
import Container from '../layout/Container';
import Section from '../layout/Section';
import PageHeader from '../layout/PageHeader';
import BaseCard from '../cards/BaseCard';

export const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Discover a Rescue',
      description: 'Browse verified rescue announcements and understand each animal’s medical needs, injury severity, admitting clinic, and treatment goals.',
      icon: Search,
      badge: 'Transparent Intake'
    },
    {
      number: '02',
      title: 'Support Their Recovery',
      description: 'Use the platform’s simulated donation experience to support a rescue campaign. Pledges are held in project-level simulated escrow pending clinical bills.',
      icon: Heart,
      badge: 'Zero Real Money'
    },
    {
      number: '03',
      title: 'Track Every Contribution',
      description: 'Explore fund allocation, expense records, verification status, and treatment updates. Every veterinary receipt is audited and viewable publicly.',
      icon: ShieldCheck,
      badge: 'Verified Proofs'
    }
  ];

  return (
    <Section id="how-it-works" spacing="default" variant="warm">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-14">
          <PageHeader
            align="center"
            eyebrow="Workflow"
            title="How Pet Rescue Works"
            subtitle="A transparent three-step bridge connecting on-ground stray rescuers, veterinary clinics, and compassionate community donors."
          />
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <BaseCard
                key={step.number}
                padding="lg"
                className="relative bg-white flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-3xl sm:text-4xl font-bold text-forest/30">
                      {step.number}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-sage-dark bg-sage-wash px-2.5 py-1 rounded-full border border-sage/30">
                      {step.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-forest-subtle flex items-center justify-center text-forest shadow-warm-sm">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-forest">
                    {step.title}
                  </h3>

                  <p className="text-sm text-charcoal-muted font-sans leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:flex items-center text-xs text-charcoal-muted/60 pt-4 border-t border-grey-light/50">
                    <span>Proceeds to next milestone</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-sage-dark" />
                  </div>
                )}
              </BaseCard>
            );
          })}
        </div>
      </Container>
    </Section>
  );
};

export default HowItWorks;
