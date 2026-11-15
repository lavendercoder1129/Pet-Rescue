import { useState } from 'react';
import { 
  Heart, 
  Shield, 
  AlertCircle, 
  Sparkles, 
  Search, 
  MapPin, 
  DollarSign, 
  FileText, 
  Activity, 
  Sliders, 
  CheckCircle,
  Eye,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

import {
  Container,
  Section,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  IconButton,
  BaseCard,
  StatCard,
  InfoCard,
  RescueCaseCard,
  StatusBadge,
  UrgencyBadge,
  ProgressBar,
  EmptyState,
  LoadingState,
  FormInput,
  FormTextarea,
  FormSelect
} from '../components';

export const DesignSystemPage = () => {
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [selectVal, setSelectVal] = useState('critical');
  const [progressVal, setProgressVal] = useState(65);

  const toggleLoading = () => {
    setLoadingDemo(true);
    setTimeout(() => setLoadingDemo(false), 2000);
  };

  const colorPalette = [
    { name: 'Forest Green', hex: '#244C3A', token: 'var(--color-forest)', role: 'Primary brand, institutional trust', bg: 'bg-[#244C3A]', text: 'text-white' },
    { name: 'Sage', hex: '#A8B9A0', token: 'var(--color-sage)', role: 'Healing harmony, secondary tint', bg: 'bg-[#A8B9A0]', text: 'text-charcoal' },
    { name: 'Warm Ivory', hex: '#FAF8F2', token: 'var(--color-ivory)', role: 'Main canvas, editorial warmth', bg: 'bg-[#FAF8F2]', text: 'text-charcoal', border: 'border border-grey-light' },
    { name: 'Muted Orange', hex: '#D98B54', token: 'var(--color-orange-muted)', role: 'Urgency highlight & primary CTA', bg: 'bg-[#D98B54]', text: 'text-white' },
    { name: 'Charcoal', hex: '#252A27', token: 'var(--color-charcoal)', role: 'Primary text & structural depth', bg: 'bg-[#252A27]', text: 'text-white' },
    { name: 'Pure White', hex: '#FFFFFF', token: 'var(--color-white)', role: 'Cards and surface backgrounds', bg: 'bg-white', text: 'text-charcoal', border: 'border border-grey-light' },
    { name: 'Light Grey', hex: '#E9E8E2', token: 'var(--color-grey-light)', role: 'Borders, hairlines & dividers', bg: 'bg-[#E9E8E2]', text: 'text-charcoal' },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Intro Header */}
      <Section spacing="sm">
        <Container>
          <div className="bg-forest text-ivory rounded-3xl p-8 sm:p-12 shadow-warm-lg relative overflow-hidden">
            <div className="relative z-10 space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-deep text-sage-light text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Module 1 Internal Showcase
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-ivory">
                Pet Rescue Design System & Reusable Components
              </h1>
              <p className="text-sage-light text-base sm:text-lg leading-relaxed font-sans max-w-2xl">
                A unified component library guided by the <strong className="text-white">Modern Compassionate Editorial</strong> aesthetic. Designed for animal protection urgency, visual clarity, and accessible user interactions.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <a href="#colors" className="text-xs px-3 py-1.5 rounded-lg bg-forest-light text-ivory hover:bg-forest-deep transition-colors">
                  Color Tokens
                </a>
                <a href="#typography" className="text-xs px-3 py-1.5 rounded-lg bg-forest-light text-ivory hover:bg-forest-deep transition-colors">
                  Typography
                </a>
                <a href="#buttons" className="text-xs px-3 py-1.5 rounded-lg bg-forest-light text-ivory hover:bg-forest-deep transition-colors">
                  Buttons
                </a>
                <a href="#cards" className="text-xs px-3 py-1.5 rounded-lg bg-forest-light text-ivory hover:bg-forest-deep transition-colors">
                  Cards
                </a>
                <a href="#badges" className="text-xs px-3 py-1.5 rounded-lg bg-forest-light text-ivory hover:bg-forest-deep transition-colors">
                  Status & Progress
                </a>
                <a href="#forms" className="text-xs px-3 py-1.5 rounded-lg bg-forest-light text-ivory hover:bg-forest-deep transition-colors">
                  Forms
                </a>
              </div>
            </div>
            
            {/* Ambient paw icon watermark */}
            <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
              <Heart className="w-80 h-80 text-white fill-white" />
            </div>
          </div>
        </Container>
      </Section>

      {/* 1. Color Palette Tokens */}
      <Section id="colors" spacing="sm">
        <Container>
          <PageHeader
            eyebrow="Tokens"
            title="Design Color Palette"
            subtitle="Defined as reusable CSS tokens and Tailwind extensions, avoiding hardcoded values."
          />

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {colorPalette.map((c) => (
              <div
                key={c.name}
                className={`rounded-2xl p-5 ${c.bg} ${c.text} ${c.border || ''} shadow-warm transition-transform duration-200 hover:-translate-y-1`}
              >
                <div className="h-16 flex items-start justify-end">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/10 backdrop-blur-sm">
                    {c.hex}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="font-serif font-bold text-lg">{c.name}</div>
                  <div className="text-xs font-mono opacity-80">{c.token}</div>
                  <div className="text-xs opacity-90 pt-1 leading-snug">{c.role}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 2. Typography Scale */}
      <Section id="typography" spacing="sm" variant="warm">
        <Container>
          <PageHeader
            eyebrow="Hierarchy"
            title="Typography Scale"
            subtitle="Pairing Playfair Display for editorial prominence with Inter for crisp, accessible UI."
          />

          <div className="mt-8 bg-white rounded-2xl p-6 sm:p-10 border border-grey-light shadow-warm space-y-8">
            <div className="border-b border-grey-light/70 pb-6">
              <span className="text-xs font-mono text-charcoal-muted uppercase block mb-1">
                Display Heading — Playfair Display Bold (font-serif text-5xl)
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-forest leading-tight">
                Emergency stray animal rescue coordination.
              </h1>
            </div>

            <div className="border-b border-grey-light/70 pb-6">
              <span className="text-xs font-mono text-charcoal-muted uppercase block mb-1">
                Page Heading — Playfair Display Bold (font-serif text-3xl)
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest">
                Transparent community-funded animal medical care
              </h2>
            </div>

            <div className="border-b border-grey-light/70 pb-6">
              <span className="text-xs font-mono text-charcoal-muted uppercase block mb-1">
                Section Heading — Playfair Display Semibold (font-serif text-2xl)
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal">
                Verified veterinary expenditure proofs and surgery updates
              </h3>
            </div>

            <div className="border-b border-grey-light/70 pb-6">
              <span className="text-xs font-mono text-charcoal-muted uppercase block mb-1">
                Card Heading — Playfair Display (font-serif text-lg font-bold)
              </span>
              <h4 className="font-serif text-lg font-bold text-forest">
                Sheru: Critical pelvic fracture rescue case #204
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <span className="text-xs font-mono text-charcoal-muted uppercase block">
                  Body Text — Inter Regular (font-sans text-base)
                </span>
                <p className="text-charcoal-soft text-base leading-relaxed">
                  Our network connects on-ground rescuers directly with community donors. Every rescue case undergoes administrative triage and requires stamped veterinary expenditure invoices before simulated escrow funds are cleared.
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-charcoal-muted uppercase block">
                  Metadata & Captions — Inter (font-sans text-xs tracking-wider)
                </span>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  CASE ID: PR-2026-089 • LOCATION: INDIRANAGAR SECTOR 4 • VERIFIED BY VET ON 15 NOV 2026 • ACADEMIC SIMULATION PLATFORM ONLY
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 3. Button Component Family */}
      <Section id="buttons" spacing="sm">
        <Container>
          <PageHeader
            eyebrow="Actions"
            title="Button Components & States"
            subtitle="Accessible buttons with active touch physics, keyboard focus rings, and simulated loading states."
          />

          <div className="mt-8 space-y-8">
            {/* Primary Buttons */}
            <BaseCard padding="md">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-lg font-bold text-forest">Primary Button</h2>
                  <span className="text-xs font-mono text-charcoal-muted">PrimaryButton.jsx</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <PrimaryButton size="sm">Small Action</PrimaryButton>
                  <PrimaryButton size="md" icon={Heart}>Support Case</PrimaryButton>
                  <PrimaryButton size="lg" icon={ArrowRight} iconPosition="right">Emergency Report</PrimaryButton>
                  <PrimaryButton isLoading={loadingDemo} onClick={toggleLoading}>
                    {loadingDemo ? 'Simulating...' : 'Click to Test Loading'}
                  </PrimaryButton>
                  <PrimaryButton disabled>Disabled State</PrimaryButton>
                </div>
              </div>
            </BaseCard>

            {/* Secondary & Outline Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseCard padding="md">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-lg font-bold text-forest">Secondary Button</h2>
                    <span className="text-xs font-mono text-charcoal-muted">SecondaryButton.jsx</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <SecondaryButton size="sm">Quick Filter</SecondaryButton>
                    <SecondaryButton size="md" icon={Search}>Browse Cases</SecondaryButton>
                    <SecondaryButton disabled>Disabled</SecondaryButton>
                  </div>
                </div>
              </BaseCard>

              <BaseCard padding="md">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-lg font-bold text-forest">Outline Button</h2>
                    <span className="text-xs font-mono text-charcoal-muted">OutlineButton.jsx</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <OutlineButton size="sm">Audit Log</OutlineButton>
                    <OutlineButton size="md" variant="forest" icon={FileText}>View Receipts</OutlineButton>
                    <OutlineButton size="md" variant="orange">Emergency</OutlineButton>
                    <OutlineButton disabled>Disabled</OutlineButton>
                  </div>
                </div>
              </BaseCard>
            </div>

            {/* Icon Buttons */}
            <BaseCard padding="md">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-lg font-bold text-forest">Icon Buttons</h2>
                  <span className="text-xs font-mono text-charcoal-muted">IconButton.jsx</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <IconButton icon={Heart} title="Save to Favorites" variant="default" />
                  <IconButton icon={Search} title="Search Cases" variant="outline" />
                  <IconButton icon={Sliders} title="Filter Settings" variant="filled" />
                  <IconButton icon={AlertCircle} title="Urgent Alert" variant="accent" />
                  <IconButton icon={Eye} title="Preview Details" variant="ghost" />
                  <IconButton icon={RefreshCw} title="Loading" isLoading={true} />
                  <IconButton icon={Shield} title="Disabled" disabled />
                </div>
              </div>
            </BaseCard>
          </div>
        </Container>
      </Section>

      {/* 4. Card Components */}
      <Section id="cards" spacing="sm" variant="warm">
        <Container>
          <PageHeader
            eyebrow="Surfaces"
            title="Card Components"
            subtitle="Information architecture cards featuring authentic stray animal rescue previews."
          />

          {/* Rescue Case Cards Grid */}
          <div className="mt-8 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-forest">RescueCaseCard Previews</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <RescueCaseCard
                title="Bella: Street Pup with Dislocated Shoulder"
                animalType="Dog"
                location="Sector 14, Old Town Market"
                injuryDescription="Found immobile near construction barrier after hit-and-run incident. Needs immediate X-ray and splint immobilization."
                urgency="critical"
                currentAmount={8500}
                targetAmount={12000}
                donorCount={14}
                onDonate={() => alert('Simulated donation will be handled in Module 4.')}
              />

              <RescueCaseCard
                title="Milo: Severe Dehydration & Eye Infection"
                animalType="Kitten"
                location="Koramangala 5th Block"
                injuryDescription="Abandoned 4-week kitten suffering acute bilateral conjunctivitis and malnutrition. Requires antibacterial therapy and fluid care."
                urgency="urgent"
                currentAmount={3200}
                targetAmount={4500}
                donorCount={9}
                onDonate={() => alert('Simulated donation will be handled in Module 4.')}
              />

              <RescueCaseCard
                title="Rocky: Leg Wound Dressing & Recovery"
                animalType="Dog"
                location="Whitefield Main Road"
                injuryDescription="Rescued deep laceration on right hind leg. Stitches completed; daily antiseptic dressing and antibiotic course ongoing."
                urgency="normal"
                currentAmount={6000}
                targetAmount={6000}
                donorCount={18}
                onDonate={() => alert('Case is already fully simulated funded!')}
              />
            </div>
          </div>

          {/* Stat & Info Cards Grid */}
          <div className="mt-12 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-forest">StatCard & InfoCard Previews</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Rescues"
                value="142"
                subtitle="Cases verified by admin"
                icon={Activity}
                colorScheme="forest"
              />
              <StatCard
                title="Simulated Funds"
                value="₹2,84,500"
                subtitle="Distributed to vet clinics"
                icon={DollarSign}
                colorScheme="orange"
              />
              <StatCard
                title="Active Rescuers"
                value="38"
                subtitle="Field responders active"
                icon={MapPin}
                colorScheme="sage"
              />
              <StatCard
                title="Recovery Rate"
                value="94.2%"
                subtitle="Discharged to foster"
                icon={CheckCircle}
                colorScheme="forest"
                trend={{ value: '+4.8% this month', positive: true }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <InfoCard
                title="Veterinary Verification Triage"
                description="Rescuers must submit physical clinic slips and vet registration numbers before case funding goes live."
                scheme="forest"
                icon={Shield}
              />
              <InfoCard
                title="Emergency Hotline Available"
                description="Community members in high incident zones can report critically injured strays 24/7."
                scheme="orange"
                icon={AlertCircle}
              />
              <InfoCard
                title="Zero Transaction Fees (Simulated)"
                description="100% of donor funding goes directly towards medical invoices with zero platform deduction."
                scheme="sage"
                icon={Sparkles}
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* 5. Status, Badges & Progress */}
      <Section id="badges" spacing="sm">
        <Container>
          <PageHeader
            eyebrow="Feedback"
            title="Status Badges, Urgency & Progress"
            subtitle="Semantic indicators communicating clinical urgency and fundraising milestones."
          />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Badges */}
            <BaseCard padding="md" className="space-y-6">
              <div className="space-y-3">
                <h2 className="font-serif text-lg font-bold text-forest">Urgency Badges</h2>
                <div className="flex flex-wrap gap-2.5">
                  <UrgencyBadge level="critical" />
                  <UrgencyBadge level="urgent" />
                  <UrgencyBadge level="normal" />
                  <UrgencyBadge level="resolved" />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-grey-light">
                <h2 className="font-serif text-lg font-bold text-forest">Status Badges</h2>
                <div className="flex flex-wrap gap-2.5">
                  <StatusBadge status="verified" />
                  <StatusBadge status="pending" />
                  <StatusBadge status="review" />
                  <StatusBadge status="active" />
                  <StatusBadge status="closed" />
                  <StatusBadge status="alert" />
                </div>
              </div>
            </BaseCard>

            {/* Progress Bars */}
            <BaseCard padding="md" className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-forest">Progress Bar Variants</h2>
                <button
                  type="button"
                  onClick={() => setProgressVal((prev) => (prev >= 100 ? 25 : prev + 25))}
                  className="text-xs px-2.5 py-1 rounded bg-ivory-warm text-charcoal-muted hover:text-forest border border-grey-light"
                >
                  Cycle: {progressVal}%
                </button>
              </div>

              <div className="space-y-4 pt-2">
                <ProgressBar
                  value={progressVal}
                  max={100}
                  showLabels
                  label="Forest Scheme"
                  variant="forest"
                  size="md"
                />

                <ProgressBar
                  value={85}
                  max={100}
                  showLabels
                  label="Urgent Orange Scheme"
                  variant="orange"
                  size="sm"
                />

                <ProgressBar
                  value={100}
                  max={100}
                  showLabels
                  label="Fully Funded (Emerald Scheme)"
                  variant="emerald"
                  size="lg"
                />
              </div>
            </BaseCard>
          </div>

          {/* Empty & Loading States */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState
              title="No rescue cases in your district"
              description="There are currently no active emergency rescue cases reported in your selected neighborhood."
              action={<SecondaryButton size="sm">Clear Filter</SecondaryButton>}
            />
            <LoadingState
              message="Verifying medical documentation..."
              subtext="Auditing uploaded veterinary clinic bill scans"
            />
          </div>
        </Container>
      </Section>

      {/* 6. Form Controls */}
      <Section id="forms" spacing="sm" variant="warm">
        <Container>
          <PageHeader
            eyebrow="Inputs"
            title="Form Components"
            subtitle="Accessible inputs with validation states, focus indicators, and helper text."
          />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <BaseCard padding="lg" className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    id="rescuerName"
                    label="Rescuer Name"
                    placeholder="e.g. Ananya Sharma"
                    required
                    helperText="Your name will be visible to donors"
                  />

                  <FormInput
                    id="contactNumber"
                    label="Phone Number"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelect
                    id="caseUrgency"
                    label="Emergency Severity"
                    value={selectVal}
                    onChange={(e) => setSelectVal(e.target.value)}
                    required
                    options={[
                      { value: 'critical', label: 'Critical — Life Threatening' },
                      { value: 'urgent', label: 'Urgent — Immediate Care Required' },
                      { value: 'normal', label: 'Normal — Stable, Needs Medical Support' },
                    ]}
                  />

                  <FormInput
                    id="fundTarget"
                    label="Target Medical Fund (₹)"
                    type="number"
                    placeholder="e.g. 7500"
                    required
                    icon={DollarSign}
                  />
                </div>

                <FormTextarea
                  id="caseDescription"
                  label="Rescue Incident Description"
                  rows={3}
                  required
                  placeholder="Describe the animal condition, injury type, exact landmark, and veterinary triage actions taken..."
                  helperText="Be as specific as possible regarding physical trauma and vet recommendations"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <FormInput
                    id="errorExample"
                    label="Validation Error State"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    error="Veterinary estimation invoice is required"
                  />

                  <FormInput
                    id="disabledExample"
                    label="Disabled Input"
                    defaultValue="Locked field (verified by admin)"
                    disabled
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-grey-light">
                  <OutlineButton>Reset Form</OutlineButton>
                  <PrimaryButton icon={Heart}>Submit Emergency Report</PrimaryButton>
                </div>
              </BaseCard>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <InfoCard
                title="Form UX Guidance"
                description="Forms use visible labels (never placeholders as labels), distinct red required marks, and 44px+ touch heights compliant with WCAG 2.1 AA."
                scheme="neutral"
              />

              <BaseCard padding="md" className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  Interactive State Preview
                </span>
                <div className="text-xs space-y-1 font-mono text-charcoal-muted bg-ivory-warm p-3 rounded-lg border border-grey-light">
                  <div>Urgency Selected: <strong className="text-forest">{selectVal}</strong></div>
                  <div>Progress Value: <strong className="text-forest">{progressVal}%</strong></div>
                  <div>Form Ready: <strong className="text-emerald-700">Valid</strong></div>
                </div>
              </BaseCard>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default DesignSystemPage;
