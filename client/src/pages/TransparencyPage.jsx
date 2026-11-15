import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Container from '../components/layout/Container';
import Section from '../components/layout/Section';
import PageHeader from '../components/layout/PageHeader';
import BaseCard from '../components/cards/BaseCard';
import { mockTransparencyFinancials } from '../data/mockCases';

export const TransparencyPage = () => {
  const fin = mockTransparencyFinancials;

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
            eyebrow="Financial Accountability"
            title="Fund Transparency Ledger"
            subtitle="Explore how every simulated rupee is audited against veterinary invoices before and after medical treatment."
          />
        </div>

        {/* Academic Simulation Banner */}
        <div className="rounded-xl p-4 mb-8 bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-800 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Simulated Academic Demonstration:</strong> All financial entries below represent software mockup models. No real banking accounts or live UPI transfers exist.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          <BaseCard padding="md">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">Collected</span>
            <div className="font-serif text-2xl font-bold text-forest my-1">₹{fin.collected.toLocaleString()}</div>
            <p className="text-xs text-charcoal-muted">Pledged across all cases</p>
          </BaseCard>

          <BaseCard padding="md">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">Allocated</span>
            <div className="font-serif text-2xl font-bold text-forest my-1">₹{fin.allocated.toLocaleString()}</div>
            <p className="text-xs text-charcoal-muted">Committed to active surgery</p>
          </BaseCard>

          <BaseCard padding="md">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">Spent</span>
            <div className="font-serif text-2xl font-bold text-charcoal my-1">₹{fin.spent.toLocaleString()}</div>
            <p className="text-xs text-charcoal-muted">Disbursed to clinics</p>
          </BaseCard>

          <BaseCard padding="md" className="bg-sage-wash/70 border-sage/40">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">Verified</span>
            <div className="font-serif text-2xl font-bold text-forest my-1">₹{fin.verified.toLocaleString()}</div>
            <p className="text-xs text-charcoal-muted">100% receipt audited</p>
          </BaseCard>

          <BaseCard padding="md" className="bg-orange-subtle/50 border-orange-muted/30">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">Remaining</span>
            <div className="font-serif text-2xl font-bold text-orange-hover my-1">₹{fin.remaining.toLocaleString()}</div>
            <p className="text-xs text-charcoal-muted">Ready in escrow</p>
          </BaseCard>
        </div>

        <BaseCard padding="lg" className="space-y-4">
          <h3 className="font-serif text-2xl font-bold text-forest">The 5-Step Transparency Guarantee</h3>
          <ul className="space-y-3 text-sm text-charcoal-soft">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Step 1: On-ground rescuer submits injury photos and clinical admission estimate.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Step 2: Platform administrators verify clinic contact details and vet registration code.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Step 3: Simulated contributions lock into case escrow with zero platform fee deduction.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Step 4: Clinic invoices and discharge certificates are uploaded for public review.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Step 5: Post-treatment recovery updates are shared directly with campaign donors.</span>
            </li>
          </ul>
        </BaseCard>
      </Container>
    </Section>
  );
};

export default TransparencyPage;
