import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Heart,
  TrendingUp,
  Search,
  Layers,
  Building2,
  FileText,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { getTransparencySummary, getTransparencyCases } from '../services/api';
import Container from '../components/layout/Container';
import Section from '../components/layout/Section';
import PageHeader from '../components/layout/PageHeader';
import BaseCard from '../components/cards/BaseCard';
import StatCard from '../components/cards/StatCard';
import PrimaryButton from '../components/common/PrimaryButton';
import OutlineButton from '../components/common/OutlineButton';
import FormInput from '../components/forms/FormInput';
import ProgressBar from '../components/feedback/ProgressBar';
import UrgencyBadge from '../components/feedback/UrgencyBadge';
import LoadingState from '../components/feedback/LoadingState';
import EmptyState from '../components/feedback/EmptyState';

export const TransparencyPage = () => {
  const [summary, setSummary] = useState({
    totalDonations: 0,
    totalAllocated: 0,
    totalVerifiedSpending: 0,
    remainingAllocatedFunds: 0,
    unallocatedFunds: 0,
    overallUtilization: 0,
    approvedCasesCount: 0,
    categoryDistribution: [],
  });
  const [cases, setCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const data = await getTransparencySummary();
      if (data && data.success && data.stats) {
        setSummary(data.stats);
      }
    } catch {
      // Non-blocking
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransparencyCases({
        search: searchQuery,
        page,
        limit: 9,
      });

      if (data && data.success) {
        setCases(data.cases || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load transparency campaign ledger.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, page]);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCases();
  };

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container>
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Home
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8 pb-6 border-b border-grey-light">
          <PageHeader
            eyebrow="Financial Accountability"
            title="Public Fund Transparency Ledger"
            subtitle="Real-time public accounting of every simulated rupee pledged, committed to veterinary surgery, and audited against hospital invoices."
          />
        </div>

        {/* Mandatory Academic Disclosure Banner */}
        <div className="rounded-2xl p-4 sm:p-5 mb-8 bg-amber-50/90 border border-amber-200/90 shadow-warm-xs flex items-start gap-3.5 text-xs text-amber-950">
          <AlertCircle className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="block text-sm font-serif font-bold text-amber-950">
              Academic Demonstration System Notice
            </strong>
            <p className="leading-relaxed">
              These figures are generated within an academic demonstration system. They do not represent actual donations, payments, or financial transfers. No real currency is accepted or transacted.
            </p>
          </div>
        </div>

        {/* 5 Core Financial Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-10">
          <StatCard
            title="Total Donations"
            value={summaryLoading ? '...' : `₹${summary.totalDonations.toLocaleString()}`}
            subtitle="Simulated pledges received"
            colorScheme="forest"
            icon={Heart}
          />
          <StatCard
            title="Allocated Funds"
            value={summaryLoading ? '...' : `₹${summary.totalAllocated.toLocaleString()}`}
            subtitle="Committed to treatments"
            colorScheme="orange"
            icon={Layers}
          />
          <StatCard
            title="Verified Spending"
            value={summaryLoading ? '...' : `₹${summary.totalVerifiedSpending.toLocaleString()}`}
            subtitle="Approved clinic invoices"
            colorScheme="sage"
            icon={ShieldCheck}
          />
          <StatCard
            title="Allocated Balance"
            value={summaryLoading ? '...' : `₹${summary.remainingAllocatedFunds.toLocaleString()}`}
            subtitle="Held in clinical escrow"
            colorScheme="emerald"
            icon={TrendingUp}
          />
          <StatCard
            title="Unallocated Funds"
            value={summaryLoading ? '...' : `₹${summary.unallocatedFunds.toLocaleString()}`}
            subtitle="Awaiting allocation"
            colorScheme="charcoal"
            icon={Building2}
          />
        </div>

        {/* Visual Charts & Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Category Distribution Chart / Text Alternative */}
          <div className="lg:col-span-7">
            <BaseCard padding="lg" className="space-y-4 bg-white shadow-warm-xs border border-grey-light h-full font-sans">
              <div className="flex items-center justify-between border-b border-grey-light pb-3">
                <div className="flex items-center gap-2 text-forest">
                  <Layers className="w-4 h-4 text-forest" />
                  <h3 className="font-serif text-lg font-bold">
                    Committed Funds by Treatment Category
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-charcoal-muted">
                  Simulated INR
                </span>
              </div>

              {summary.categoryDistribution?.length === 0 ? (
                <div className="py-8 text-center text-xs text-charcoal-muted">
                  No categorized allocations recorded yet.
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {summary.categoryDistribution.map((cat) => {
                    const pct = summary.totalAllocated > 0
                      ? Math.round((cat.totalAmount / summary.totalAllocated) * 100)
                      : 0;
                    return (
                      <div key={cat._id} className="space-y-1 text-xs">
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-charcoal">{cat._id}</span>
                          <div className="text-right">
                            <strong className="text-forest">₹{cat.totalAmount.toLocaleString()}</strong>
                            <span className="text-[11px] text-charcoal-muted ml-1.5">({pct}%)</span>
                          </div>
                        </div>
                        <ProgressBar
                          value={cat.totalAmount}
                          max={summary.totalAllocated || 1}
                          variant="forest"
                          size="sm"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </BaseCard>
          </div>

          {/* Escrow Health & Utilization */}
          <div className="lg:col-span-5">
            <BaseCard padding="lg" className="space-y-4 bg-white shadow-warm-xs border border-grey-light h-full flex flex-col justify-between font-sans">
              <div>
                <div className="flex items-center gap-2 border-b border-grey-light pb-3 text-forest">
                  <TrendingUp className="w-4 h-4 text-forest" />
                  <h3 className="font-serif text-lg font-bold">
                    Verified Spending Utilization
                  </h3>
                </div>

                <div className="py-6 text-center">
                  <div className="font-serif text-5xl font-bold text-forest">
                    {summary.overallUtilization}%
                  </div>
                  <span className="text-xs text-charcoal-muted uppercase tracking-wider font-semibold block mt-1">
                    Spending vs Allocated Escrow
                  </span>
                </div>

                <ProgressBar
                  value={summary.totalVerifiedSpending}
                  max={summary.totalAllocated || 1}
                  variant="emerald"
                  size="md"
                />

                <p className="text-[11px] text-charcoal-muted mt-4 leading-relaxed">
                  Only hospital bills and surgery invoices audited and approved by administrators count as verified spending. Unspent allocated balances remain safely held in virtual escrow for aftercare.
                </p>
              </div>

              <div className="pt-3 border-t border-grey-light flex items-center justify-between text-xs">
                <span className="text-charcoal-muted">Clinical Oversight:</span>
                <span className="font-semibold text-forest">100% Invoice Audited</span>
              </div>
            </BaseCard>
          </div>
        </div>

        {/* Campaign-Level Transparency Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-forest">
              Campaign-Level Financial Breakdown
            </h2>
            <p className="text-xs text-charcoal-muted mt-0.5 font-sans">
              Explore live financial ledger balances per verified animal rescue case.
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative">
              <FormInput
                type="text"
                placeholder="Search cases or animals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs py-1.5 w-60"
              />
              <Search className="w-3.5 h-3.5 text-charcoal-muted absolute left-2.5 top-3" />
            </div>
            <PrimaryButton type="submit" size="sm" className="px-3 text-xs">
              Search
            </PrimaryButton>
            {searchQuery && (
              <OutlineButton
                type="button"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
              >
                Clear
              </OutlineButton>
            )}
          </form>
        </div>

        {/* Campaign Cards Grid */}
        {loading ? (
          <div className="py-16">
            <LoadingState
              message="Loading campaign transparency ledger..."
              subtext="Aggregating simulated pledges and audited clinical receipts"
            />
          </div>
        ) : error ? (
          <div className="py-12">
            <EmptyState
              icon={AlertCircle}
              title="Ledger Unavailable"
              description={error}
              action={
                <OutlineButton icon={RefreshCw} onClick={fetchCases}>
                  Retry
                </OutlineButton>
              }
            />
          </div>
        ) : cases.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No Campaign Records Found"
              description="No approved rescue cases matched your search query."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 font-sans">
            {cases.map((c) => {
              const fin = c.financials || {};
              const primaryImg =
                c.images && c.images.length > 0
                  ? c.images[0].startsWith('http')
                    ? c.images[0]
                    : `http://localhost:5000${c.images[0]}`
                  : 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80';

              return (
                <BaseCard key={c._id} padding="md" className="space-y-4 bg-white shadow-warm-xs border border-grey-light flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Animal header */}
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-ivory-warm flex-shrink-0 border border-grey-light">
                        <img
                          src={primaryImg}
                          alt={c.animalName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <UrgencyBadge level={c.urgencyLevel.toLowerCase()} />
                          <span className="text-[10px] text-charcoal-muted uppercase font-semibold">
                            {c.animalType}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-base text-forest truncate mt-0.5">
                          {c.title}
                        </h3>
                        <div className="text-[11px] text-charcoal-muted flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-sage-dark flex-shrink-0" />
                          <span>{c.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Numbers Matrix */}
                    <div className="p-3.5 rounded-xl bg-ivory-warm/60 border border-grey-light/60 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-charcoal-muted">Simulated Donations:</span>
                        <strong className="text-forest font-serif text-sm">
                          ₹{(fin.totalDonations || 0).toLocaleString()}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-muted">Allocated Funds:</span>
                        <span className="font-semibold text-charcoal">
                          ₹{(fin.totalAllocated || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-muted">Verified Spending:</span>
                        <span className="text-charcoal">
                          ₹{(fin.totalVerifiedSpending || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-grey-light/60">
                        <span className="text-charcoal-muted">Remaining Balance:</span>
                        <strong className="text-emerald-800">
                          ₹{(fin.remainingAllocatedBalance || 0).toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    {/* Progress Bar for Fund Utilization */}
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between text-charcoal-muted">
                        <span>Fund Utilization</span>
                        <span className="font-semibold text-forest">{fin.fundUtilization || 0}%</span>
                      </div>
                      <ProgressBar
                        value={fin.totalVerifiedSpending || 0}
                        max={fin.totalAllocated || 1}
                        variant="emerald"
                        size="xs"
                      />
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="pt-2 border-t border-grey-light flex items-center justify-between">
                    <span className="text-[10px] text-charcoal-muted">
                      Goal: ₹{(c.fundraisingGoal || 0).toLocaleString()}
                    </span>
                    <Link
                      to={`/cases/${c._id}`}
                      className="text-xs font-semibold text-forest hover:underline inline-flex items-center gap-1"
                    >
                      Case Transparency <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </BaseCard>
              );
            })}
          </div>
        )}

        {/* 5-Step Transparency Guarantee Box */}
        <BaseCard padding="lg" className="space-y-4 bg-white shadow-warm-xs border border-grey-light font-sans">
          <h3 className="font-serif text-2xl font-bold text-forest">
            The 5-Step Transparency Guarantee
          </h3>
          <p className="text-xs text-charcoal-muted leading-relaxed">
            Pet Rescue operates on strict escrow segregation principles to ensure every simulated rupee is traceable back to clinical outcomes.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-charcoal-soft pt-2">
            <li className="p-3 rounded-xl bg-ivory-warm border border-grey-light space-y-1">
              <strong className="text-forest flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                1. Clinical Estimate
              </strong>
              <p className="text-[11px] text-charcoal-muted">
                Rescuers submit trauma diagnosis with attending veterinary clinic cost sheet.
              </p>
            </li>
            <li className="p-3 rounded-xl bg-ivory-warm border border-grey-light space-y-1">
              <strong className="text-forest flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                2. Admin Triage Audit
              </strong>
              <p className="text-[11px] text-charcoal-muted">
                Administrators verify registered veterinary credentials before activating campaigns.
              </p>
            </li>
            <li className="p-3 rounded-xl bg-ivory-warm border border-grey-light space-y-1">
              <strong className="text-forest flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                3. Dedicated Escrow
              </strong>
              <p className="text-[11px] text-charcoal-muted">
                Pledged funds lock into isolated simulated escrow accounts per rescue patient.
              </p>
            </li>
            <li className="p-3 rounded-xl bg-ivory-warm border border-grey-light space-y-1">
              <strong className="text-forest flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                4. Verified Spending
              </strong>
              <p className="text-[11px] text-charcoal-muted">
                Only expenses confirmed against uploaded hospital invoices count as verified spending.
              </p>
            </li>
            <li className="p-3 rounded-xl bg-ivory-warm border border-grey-light space-y-1">
              <strong className="text-forest flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                5. Public Ledger
              </strong>
              <p className="text-[11px] text-charcoal-muted">
                Unallocated balances and remaining funds are openly exposed for public community audit.
              </p>
            </li>
          </ul>
        </BaseCard>
      </Container>
    </Section>
  );
};

export default TransparencyPage;
