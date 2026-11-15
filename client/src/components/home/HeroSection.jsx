import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, HeartHandshake, ShieldAlert } from 'lucide-react';
import Container from '../layout/Container';
import Section from '../layout/Section';
import PrimaryButton from '../common/PrimaryButton';
import SecondaryButton from '../common/SecondaryButton';
import heroDogImg from '../../assets/images/hero-dog.jpg';

export const HeroSection = () => {
  return (
    <Section spacing="sm" className="pt-6 sm:pt-10 pb-12 sm:pb-20 overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Urgent Support Indicator */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-subtle border border-orange-muted/30 text-orange-hover text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-orange-muted animate-pulse" />
              <ShieldAlert className="w-3.5 h-3.5 text-orange-muted" />
              <span>Urgent Emergency Rescue Coordination</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-forest leading-[1.12] tracking-tight">
              Every Life Deserves a Second Chance.
            </h1>

            <p className="text-base sm:text-lg text-charcoal-muted font-sans leading-relaxed max-w-2xl">
              Help injured and abandoned animals receive the treatment, care, and protection they deserve. Discover rescue cases, support their recovery, and follow how every contribution is accounted for.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/cases">
                <PrimaryButton size="lg" icon={ArrowRight} iconPosition="right">
                  Explore Emergency Cases
                </PrimaryButton>
              </Link>

              <a href="#how-it-works">
                <SecondaryButton size="lg" icon={HeartHandshake}>
                  How Pet Rescue Works
                </SecondaryButton>
              </a>
            </div>

            {/* Credibility / Verification Badges */}
            <div className="pt-4 border-t border-grey-light/70 grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="font-serif font-bold text-base sm:text-lg text-forest block">100%</span>
                <span className="text-charcoal-muted">Verified clinic bills</span>
              </div>
              <div>
                <span className="font-serif font-bold text-base sm:text-lg text-forest block">Zero Fee</span>
                <span className="text-charcoal-muted">Simulated allocation</span>
              </div>
              <div>
                <span className="font-serif font-bold text-base sm:text-lg text-forest block">Live Updates</span>
                <span className="text-charcoal-muted">Treatment logs</span>
              </div>
            </div>
          </div>

          {/* Right Editorial Image Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Photo Frame with subtle warm depth */}
              <div className="rounded-3xl overflow-hidden shadow-warm-lg border-2 border-white bg-ivory-warm">
                <img
                  src={heroDogImg}
                  alt="Rescued indie dog in recovery with compassionate gaze"
                  className="w-full aspect-[4/5] object-cover object-center"
                  loading="eager"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
              </div>

              {/* Floating Emergency Badge */}
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white/95 backdrop-blur-md border border-grey-light p-4 rounded-2xl shadow-warm max-w-xs space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-forest font-sans">
                    On-Ground Triage Active
                  </span>
                </div>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  Rescuers across 6 city zones submitting live emergency injury proofs.
                </p>
              </div>

              {/* Floating Stat Accent */}
              <div className="hidden sm:flex absolute -top-4 -right-4 bg-forest text-ivory p-3.5 rounded-2xl shadow-warm-md items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-forest-light flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-sage-light" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-sage-light font-medium block">
                    Academic Platform
                  </span>
                  <span className="text-xs font-bold">100% Simulated Flow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default HeroSection;
