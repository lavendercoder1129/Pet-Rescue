import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, MapPin, Calendar } from 'lucide-react';
import Container from '../layout/Container';
import Section from '../layout/Section';
import PageHeader from '../layout/PageHeader';
import PrimaryButton from '../common/PrimaryButton';
import StatusBadge from '../feedback/StatusBadge';
import storyImg from '../../assets/images/story-charlie.jpg';

export const RescueStory = () => {
  return (
    <Section spacing="default" variant="warm">
      <Container>
        <div className="bg-white rounded-3xl border border-grey-light shadow-warm-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Story Image Frame */}
            <div className="lg:col-span-5 relative bg-ivory-warm min-h-[320px] lg:min-h-full">
              <img
                src={storyImg}
                alt="Charlie, a rescued golden-mix dog standing healthy in grass after recovery"
                className="w-full h-full object-cover object-center"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1000&q=80';
                }}
              />
              <div className="absolute top-4 left-4">
                <StatusBadge status="verified" label="Fully Recovered & Discharged" />
              </div>
            </div>

            {/* Story Narrative Content */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-muted">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sage-dark" />
                    <span>Sarjapur Road Junction</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sage-dark" />
                    <span>Rescue Date: October 14, 2026</span>
                  </div>
                </div>

                <PageHeader
                  eyebrow="Rescue Journey"
                  title="From Severe Road Trauma to a Joyful Second Chance: Charlie's Story"
                  subtitle="How community vigilance and rapid veterinary intervention turned a hopeless night into a full recovery."
                />

                <div className="space-y-4 text-sm text-charcoal-soft font-sans leading-relaxed">
                  <p>
                    Charlie was spotted lying near a storm drain after a heavy monsoon storm. He had suffered multiple soft tissue tears and was unable to stand on his hind paws. Rescuer Arvind initiated an emergency report on Pet Rescue within minutes.
                  </p>
                  <p>
                    Through community supporters pledging simulated treatment funds, Charlie received emergency wound debridement, antibiotic therapy, and three weeks of supportive foster rehabilitation. All vet receipts and medication logs were published and verified directly on the platform.
                  </p>
                </div>

                {/* Milestone Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="rounded-xl bg-ivory-warm/80 p-3.5 border border-grey-light text-xs space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-charcoal-muted tracking-wider block">Day 01</span>
                    <span className="font-serif font-bold text-forest block">Emergency Triage</span>
                    <span className="text-charcoal-muted">X-ray & IV fluids</span>
                  </div>
                  <div className="rounded-xl bg-ivory-warm/80 p-3.5 border border-grey-light text-xs space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-charcoal-muted tracking-wider block">Day 12</span>
                    <span className="font-serif font-bold text-forest block">Sutures Removed</span>
                    <span className="text-charcoal-muted">Weight restored +1.8kg</span>
                  </div>
                  <div className="rounded-xl bg-ivory-warm/80 p-3.5 border border-grey-light text-xs space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-charcoal-muted tracking-wider block">Day 24</span>
                    <span className="font-serif font-bold text-forest block">Foster Adoption</span>
                    <span className="text-charcoal-muted">Healthy & walking</span>
                  </div>
                </div>
              </div>

              {/* Bottom Story CTA */}
              <div className="pt-6 border-t border-grey-light flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-charcoal-muted">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Case closed with complete public expenditure audit</span>
                </div>

                <Link to="/cases/case-bruno">
                  <PrimaryButton size="md" icon={ArrowRight} iconPosition="right">
                    Explore This Case
                  </PrimaryButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default RescueStory;
