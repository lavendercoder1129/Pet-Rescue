import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import Container from '../layout/Container';
import Section from '../layout/Section';
import PageHeader from '../layout/PageHeader';
import PrimaryButton from '../common/PrimaryButton';
import BaseCard from '../cards/BaseCard';
import { mockTransparencyFinancials } from '../../data/mockCases';

export const TransparencySection = () => {
  const fin = mockTransparencyFinancials;

  const financialConcepts = [
    {
      key: 'collected',
      label: 'Collected',
      amount: fin.collected,
      desc: 'Total simulated contributions pledged by platform supporters.',
      bg: 'bg-white',
      border: 'border-grey-light',
      textColor: 'text-forest',
    },
    {
      key: 'allocated',
      label: 'Allocated',
      amount: fin.allocated,
      desc: 'Assigned to active, verified emergency rescue campaigns.',
      bg: 'bg-white',
      border: 'border-grey-light',
      textColor: 'text-forest',
    },
    {
      key: 'spent',
      label: 'Spent',
      amount: fin.spent,
      desc: 'Disbursed to veterinary clinics against verified medical invoices.',
      bg: 'bg-white',
      border: 'border-grey-light',
      textColor: 'text-charcoal',
    },
    {
      key: 'verified',
      label: 'Verified',
      amount: fin.verified,
      desc: '100% physically stamped and audited by platform administrators.',
      bg: 'bg-sage-wash/60',
      border: 'border-sage/40',
      textColor: 'text-forest',
    },
    {
      key: 'remaining',
      label: 'Remaining',
      amount: fin.remaining,
      desc: 'Escrow balance available for emergency intensive care admissions.',
      bg: 'bg-orange-subtle/50',
      border: 'border-orange-muted/30',
      textColor: 'text-orange-hover',
    },
  ];

  return (
    <Section id="transparency" spacing="default">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Explanatory Column */}
          <div className="lg:col-span-5 space-y-6">
            <PageHeader
              eyebrow="Financial Accountability"
              title="Every Contribution. Every Expense. Clearly Tracked."
              subtitle="We believe absolute transparency is non-negotiable in animal welfare. Every rupee is tied to physical clinic slips, veterinary doctor registration numbers, and public treatment milestones."
            />

            <div className="space-y-3.5 text-sm text-charcoal-muted">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Public Receipt Scans:</strong> Uploaded medical bills are viewable by any donor anytime.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Escrow Triage:</strong> Funds remain locked until administrative verification validates clinical necessity.
                </span>
              </div>
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-orange-muted flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Academic Simulation Guardrail:</strong> All figures shown are demonstration tokens for software evaluation.
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/transparency">
                <PrimaryButton icon={ArrowRight} iconPosition="right">
                  Explore Fund Transparency
                </PrimaryButton>
              </Link>
            </div>
          </div>

          {/* Right Financial Model Visual Grid */}
          <div className="lg:col-span-7">
            <BaseCard padding="lg" className="bg-ivory-warm/60 space-y-6">
              <div className="flex items-center justify-between border-b border-grey-light pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-forest">
                    Simulated Financial Ledger
                  </h3>
                  <span className="text-xs text-charcoal-muted">
                    Five-pillar accountability model
                  </span>
                </div>
                <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-white border border-grey-light text-forest">
                  Academic Ledger v1.0
                </span>
              </div>

              {/* 5 Financial Concepts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {financialConcepts.map((item) => (
                  <div
                    key={item.key}
                    className={`rounded-xl p-4 border shadow-warm-sm transition-all hover:shadow-warm ${item.bg} ${item.border}`}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted block">
                      {item.label}
                    </span>
                    <div className={`font-serif text-2xl font-bold my-1 ${item.textColor}`}>
                      ₹{item.amount.toLocaleString()}
                    </div>
                    <p className="text-[11px] text-charcoal-muted leading-snug">
                      {item.desc}
                    </p>
                  </div>
                ))}

                {/* Audit Ratio Card */}
                <div className="rounded-xl p-4 border border-forest/30 bg-forest text-ivory shadow-warm-sm flex flex-col justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-sage-light block">
                    Audit Verification Rate
                  </span>
                  <div className="font-serif text-3xl font-bold text-white my-1">
                    100%
                  </div>
                  <p className="text-[11px] text-sage-light leading-snug">
                    Zero unverified expenditure disbursements allowed.
                  </p>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default TransparencySection;
