import { Link } from 'react-router-dom';
import { Heart, ArrowRight, BookOpen } from 'lucide-react';
import Container from '../layout/Container';
import Section from '../layout/Section';
import PrimaryButton from '../common/PrimaryButton';
import SecondaryButton from '../common/SecondaryButton';

export const FinalCTA = () => {
  return (
    <Section spacing="lg" className="bg-forest text-ivory relative overflow-hidden">
      {/* Subtle organic background circle */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-forest-light/40 pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-forest-deep/60 pointer-events-none" />

      <Container className="relative z-10 text-center max-w-3xl space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-deep/80 text-sage-light text-xs font-semibold uppercase tracking-wider border border-forest-light">
          <Heart className="w-3.5 h-3.5 text-orange-muted fill-orange-muted" />
          Join the Animal Rescue Community
        </div>

        <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
          Be the Reason They Get Another Chance.
        </h2>

        <p className="text-base sm:text-lg text-sage-light/90 font-sans leading-relaxed max-w-2xl mx-auto">
          Explore rescue cases and become part of a community that believes every animal deserves care.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link to="/cases">
            <PrimaryButton
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              className="bg-orange-muted hover:bg-orange-hover text-white shadow-warm"
            >
              Explore Rescue Cases
            </PrimaryButton>
          </Link>

          <a href="#how-it-works">
            <SecondaryButton
              size="lg"
              icon={BookOpen}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm"
            >
              Learn How It Works
            </SecondaryButton>
          </a>
        </div>

        <p className="text-xs text-sage-light/60 font-sans pt-2">
          Academic simulation project • Zero real transactions • 100% open portfolio architecture
        </p>
      </Container>
    </Section>
  );
};

export default FinalCTA;
