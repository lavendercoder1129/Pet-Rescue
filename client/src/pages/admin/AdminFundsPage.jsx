import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  DollarSign,
  PlusCircle,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  TrendingUp,
} from 'lucide-react';
import {
  getAdminFundsSummary,
  getAdminAllocations,
  createFundAllocation,
  getAdminCases,
} from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import StatCard from '../../components/cards/StatCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import FormInput from '../../components/forms/FormInput';
import FormTextarea from '../../components/forms/FormTextarea';
import ProgressBar from '../../components/feedback/ProgressBar';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';

const ALLOCATION_CATEGORIES = [
  'Emergency treatment',
  'Medicines',
  'Surgery',
  'Food and nutrition',
  'Shelter',
  'Transportation',
  'Other',
];

export const AdminFundsPage = () => {
  const [summary, setSummary] = useState({
    totalDonations: 0,
    totalAllocated: 0,
    totalVerifiedSpending: 0,
    unallocatedFunds: 0,
    remainingAllocatedBalance: 0,
    overallUtilization: 0,
    totalAllocationsCount: 0,
    categoryBreakdown: [],
  });
  const [allocations, setAllocations] = useState([]);
  const [approvedCases, setApprovedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Allocation Modal State
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [allocateCaseId, setAllocateCaseId] = useState('');
  const [selectedCaseData, setSelectedCaseData] = useState(null);
  const [allocateAmount, setAllocateAmount] = useState('');
  const [allocateCategory, setAllocateCategory] = useState('Emergency treatment');
  const [allocateDescription, setAllocateDescription] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  const fetchSummary = async () => {
    try {
      const data = await getAdminFundsSummary();
      if (data && data.success && data.stats) {
        setSummary(data.stats);
      }
    } catch {
      // Non-blocking
    }
  };

  const fetchAllocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminAllocations({
        category: selectedCategory,
        status: selectedStatus,
        page,
        limit: 10,
      });

      if (data && data.success) {
        setAllocations(data.allocations || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load fund allocation records.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedStatus, page]);

  const fetchCasesForSelect = async () => {
    try {
      const data = await getAdminCases({ status: 'Approved', limit: 50 });
      if (data && data.success) {
        setApprovedCases(data.cases || []);
      }
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchAllocations();
    fetchCasesForSelect();
  }, [fetchAllocations]);

  const handleCaseSelectChange = (e) => {
    const caseId = e.target.value;
    setAllocateCaseId(caseId);
    const matched = approvedCases.find((c) => c._id === caseId);
    setSelectedCaseData(matched || null);
    setModalError('');
  };

  const handleOpenAllocateModal = (presetCaseId = '') => {
    setModalError('');
    setActionSuccessMessage('');
    if (presetCaseId) {
      setAllocateCaseId(presetCaseId);
      const matched = approvedCases.find((c) => c._id === presetCaseId);
      setSelectedCaseData(matched || null);
    } else {
      setAllocateCaseId(approvedCases[0]?._id || '');
      setSelectedCaseData(approvedCases[0] || null);
    }
    setAllocateAmount('');
    setAllocateCategory('Emergency treatment');
    setAllocateDescription('');
    setShowAllocateModal(true);
  };

  const handleConfirmAllocation = async (e) => {
    e.preventDefault();
    if (!allocateCaseId) {
      setModalError('Please select a rescue case.');
      return;
    }

    const num = Number(allocateAmount);
    if (isNaN(num) || num <= 0) {
      setModalError('Please enter a valid positive allocation amount.');
      return;
    }

    if (!allocateDescription.trim()) {
      setModalError('Please provide an allocation justification description.');
      return;
    }

    try {
      setModalSubmitting(true);
      setModalError('');
      const res = await createFundAllocation({
        caseId: allocateCaseId,
        amount: num,
        allocationCategory: allocateCategory,
        description: allocateDescription,
      });

      setModalSubmitting(false);
      if (res && res.success) {
        setShowAllocateModal(false);
        setActionSuccessMessage(res.message || 'Fund allocation successfully recorded.');
        fetchSummary();
        fetchAllocations();
      }
    } catch (err) {
      setModalSubmitting(false);
      setModalError(err.message || 'Failed to record fund allocation.');
    }
  };

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest font-sans">
                Admin Escrow & Financial Management
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-forest text-ivory font-medium">
                Module 7 Live
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Fund Allocation Dashboard
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 max-w-2xl font-sans">
              Allocate simulated crowdfunding receipts across clinical categories, audit remaining balances, and track verified hospital expenditures.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <OutlineButton
              size="sm"
              icon={RefreshCw}
              onClick={() => {
                fetchSummary();
                fetchAllocations();
              }}
            >
              Refresh Data
            </OutlineButton>

            <PrimaryButton
              size="sm"
              icon={PlusCircle}
              onClick={() => handleOpenAllocateModal()}
            >
              Allocate Funds
            </PrimaryButton>
          </div>
        </div>

        {/* Global Academic Disclosure */}
        <div className="rounded-2xl p-4 mb-8 bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-3 shadow-warm-xs">
          <AlertCircle className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="block text-sm font-serif font-bold text-amber-950">
              Simulated Financial Demonstration
            </strong>
            <p className="leading-relaxed text-[11px]">
              All totals below are computed from mock database pledges and administrative allocation records. No real monetary transactions or banking accounts are connected.
            </p>
          </div>
        </div>

        {/* Success Alert Banner */}
        {actionSuccessMessage && (
          <div className="rounded-2xl p-4 mb-6 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* 5 Core Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
          <StatCard
            title="Total Donations"
            value={`₹${summary.totalDonations.toLocaleString()}`}
            subtitle="Simulated pledges received"
            colorScheme="forest"
            icon={DollarSign}
          />
          <StatCard
            title="Total Allocated"
            value={`₹${summary.totalAllocated.toLocaleString()}`}
            subtitle="Committed to treatments"
            colorScheme="orange"
            icon={Layers}
          />
          <StatCard
            title="Verified Spending"
            value={`₹${summary.totalVerifiedSpending.toLocaleString()}`}
            subtitle="Approved clinic proofs"
            colorScheme="sage"
            icon={ShieldCheck}
          />
          <StatCard
            title="Unallocated Funds"
            value={`₹${summary.unallocatedFunds.toLocaleString()}`}
            subtitle="Available to allocate"
            colorScheme="charcoal"
            icon={Building2}
          />
          <StatCard
            title="Allocated Balance"
            value={`₹${summary.remainingAllocatedBalance.toLocaleString()}`}
            subtitle="Ready in escrow"
            colorScheme="emerald"
            icon={TrendingUp}
          />
        </div>

        {/* Category Distribution Chart / Text Alternative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Visual Breakdown Cards */}
          <div className="lg:col-span-7">
            <BaseCard padding="lg" className="space-y-4 bg-white shadow-warm-xs border border-grey-light h-full">
              <div className="flex items-center justify-between border-b border-grey-light pb-3">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-forest" />
                  <h3 className="font-serif text-lg font-bold text-forest">
                    Fund Distribution by Category
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-charcoal-muted">
                  {summary.categoryBreakdown?.length || 0} Categories
                </span>
              </div>

              {summary.categoryBreakdown?.length === 0 ? (
                <div className="py-8 text-center text-xs text-charcoal-muted">
                  No active fund allocations recorded yet. Allocate funds to see distribution breakdown.
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {summary.categoryBreakdown.map((cat) => {
                    const pct = summary.totalAllocated > 0
                      ? Math.round((cat.allocated / summary.totalAllocated) * 100)
                      : 0;
                    return (
                      <div key={cat._id} className="space-y-1 text-xs font-sans">
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-charcoal">{cat._id}</span>
                          <div className="text-right">
                            <strong className="text-forest">₹{cat.allocated.toLocaleString()}</strong>
                            <span className="text-[11px] text-charcoal-muted ml-1.5">({pct}%)</span>
                          </div>
                        </div>
                        <ProgressBar
                          value={cat.allocated}
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

          {/* Overall Utilization Card */}
          <div className="lg:col-span-5">
            <BaseCard padding="lg" className="space-y-4 bg-white shadow-warm-xs border border-grey-light h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-grey-light pb-3 text-forest">
                  <TrendingUp className="w-4 h-4 text-forest" />
                  <h3 className="font-serif text-lg font-bold">
                    Escrow Fund Utilization
                  </h3>
                </div>

                <div className="py-6 text-center">
                  <div className="font-serif text-5xl font-bold text-forest">
                    {summary.overallUtilization}%
                  </div>
                  <span className="text-xs text-charcoal-muted uppercase tracking-wider font-semibold block mt-1">
                    Verified Spending vs Allocation
                  </span>
                </div>

                <ProgressBar
                  value={summary.totalVerifiedSpending}
                  max={summary.totalAllocated || 1}
                  variant="emerald"
                  size="md"
                />

                <p className="text-[11px] text-charcoal-muted mt-4 leading-relaxed font-sans">
                  Fund utilization represents the proportion of allocated escrow funds that have been formally verified through audited veterinary hospital invoices. Unspent allocations remain protected.
                </p>
              </div>

              <div className="pt-3 border-t border-grey-light flex items-center justify-between text-xs">
                <span className="text-charcoal-muted">Public Ledger:</span>
                <Link to="/transparency" className="font-semibold text-forest hover:underline">
                  View Public Transparency Page →
                </Link>
              </div>
            </BaseCard>
          </div>
        </div>

        {/* Filter & Allocation Ledger */}
        <div className="bg-white rounded-2xl p-4 border border-grey-light shadow-warm-xs mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 font-sans text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-charcoal-muted">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="bg-ivory-warm/60 border border-grey-light rounded-xl px-3 py-1.5 text-xs text-charcoal font-medium outline-none focus:ring-2 focus:ring-forest/20"
              >
                <option value="All">All Categories</option>
                {ALLOCATION_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-charcoal-muted">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="bg-ivory-warm/60 border border-grey-light rounded-xl px-3 py-1.5 text-xs text-charcoal font-medium outline-none focus:ring-2 focus:ring-forest/20"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Partially Spent">Partially Spent</option>
                <option value="Fully Spent">Fully Spent</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <span className="text-charcoal-muted text-[11px]">
            Showing {allocations.length} of {totalCount} allocation records
          </span>
        </div>

        {/* Allocations Table */}
        {loading ? (
          <div className="py-16">
            <LoadingState
              message="Loading fund allocations..."
              subtext="Filtering records from database"
            />
          </div>
        ) : error ? (
          <div className="py-12">
            <EmptyState
              icon={AlertCircle}
              title="Failed to Load Allocations"
              description={error}
              action={
                <OutlineButton icon={RefreshCw} onClick={fetchAllocations}>
                  Retry
                </OutlineButton>
              }
            />
          </div>
        ) : allocations.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Filter}
              title="No Allocations Found"
              description="There are currently no fund allocations matching your filter criteria. Allocate funds to a verified rescue case to see entries here."
              action={
                <PrimaryButton icon={PlusCircle} onClick={() => handleOpenAllocateModal()}>
                  Create New Allocation
                </PrimaryButton>
              }
            />
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            <div className="overflow-x-auto bg-white rounded-2xl border border-grey-light shadow-warm-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-grey-light text-charcoal-muted uppercase tracking-wider bg-ivory-warm/40">
                    <th className="p-4 font-semibold">Reference & Date</th>
                    <th className="p-4 font-semibold">Rescue Case & Patient</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold">Allocated</th>
                    <th className="p-4 font-semibold">Verified Spent</th>
                    <th className="p-4 font-semibold">Remaining</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-light/60">
                  {allocations.map((a) => {
                    const remainingBal = Math.max(0, a.amount - (a.amountSpent || 0));
                    return (
                      <tr key={a._id} className="hover:bg-ivory-warm/30 transition-colors">
                        <td className="p-4">
                          <div className="font-mono font-bold text-xs text-forest">
                            {a.allocationReference}
                          </div>
                          <div className="text-[11px] text-charcoal-muted mt-0.5">
                            {new Date(a.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-serif font-bold text-sm text-forest truncate max-w-xs">
                            {a.rescueCase?.title || 'Case'}
                          </div>
                          <div className="text-[11px] text-charcoal-muted">
                            Patient: <strong>{a.rescueCase?.animalName}</strong>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-forest-subtle text-forest">
                            {a.allocationCategory}
                          </span>
                        </td>

                        <td className="p-4">
                          <strong className="font-serif text-base text-forest">
                            ₹{a.amount.toLocaleString()}
                          </strong>
                        </td>

                        <td className="p-4 text-charcoal">
                          ₹{(a.amountSpent || 0).toLocaleString()}
                        </td>

                        <td className="p-4 font-semibold text-emerald-800">
                          ₹{remainingBal.toLocaleString()}
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              a.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : a.status === 'Cancelled'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <Link to={`/admin/cases/${a.rescueCase?._id}`}>
                            <OutlineButton size="sm" className="text-xs py-1 px-2.5">
                              Case Dossier
                            </OutlineButton>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 pt-2 text-xs text-charcoal-muted font-sans">
                <span>
                  Showing {allocations.length} of {totalCount} allocations (Page {page} of {totalPages})
                </span>
                <div className="flex items-center gap-2">
                  <OutlineButton
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    Previous
                  </OutlineButton>
                  <OutlineButton
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    Next
                  </OutlineButton>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Allocate Funds Modal */}
        {showAllocateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-warm-lg border border-grey-light space-y-5 font-sans my-8 animate-fade-in">
              <div className="flex items-center justify-between border-b border-grey-light pb-3">
                <div className="flex items-center gap-2.5 text-forest">
                  <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center text-forest">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold">Allocate Escrow Funds</h3>
                    <span className="text-xs text-charcoal-muted">Clinical Expense Commitment</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="p-1 rounded-lg hover:bg-grey-light text-charcoal-muted text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmAllocation} className="space-y-4 text-xs">
                {/* Select Case */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-charcoal">
                    Select Approved Rescue Case
                  </label>
                  <select
                    value={allocateCaseId}
                    onChange={handleCaseSelectChange}
                    className="w-full p-2.5 rounded-xl bg-ivory-warm/60 border border-grey-light text-xs text-charcoal font-medium outline-none focus:ring-2 focus:ring-forest/20"
                    required
                  >
                    {approvedCases.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.animalName} — {c.title} (Raised: ₹{(c.amountCollected || 0).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Case Financial Breakdown Preview */}
                {selectedCaseData && (
                  <div className="p-3.5 rounded-xl bg-ivory-warm border border-grey-light space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-charcoal-muted">Simulated Raised:</span>
                      <strong className="text-forest">
                        ₹{(selectedCaseData.amountCollected || 0).toLocaleString()}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-muted">Fundraising Goal:</span>
                      <span>₹{(selectedCaseData.fundraisingGoal || 0).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-charcoal">
                    Allocation Category
                  </label>
                  <select
                    value={allocateCategory}
                    onChange={(e) => setAllocateCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-ivory-warm/60 border border-grey-light text-xs text-charcoal font-medium outline-none focus:ring-2 focus:ring-forest/20"
                  >
                    {ALLOCATION_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Allocation Amount */}
                <div className="space-y-1.5">
                  <FormInput
                    label="Allocation Amount (₹ INR)"
                    type="number"
                    min="1"
                    placeholder="e.g. 5000"
                    value={allocateAmount}
                    onChange={(e) => setAllocateAmount(e.target.value)}
                    required
                  />
                  <span className="text-[11px] text-charcoal-muted">
                    Amount cannot exceed available unallocated funds for this rescue case.
                  </span>
                </div>

                {/* Justification Description */}
                <div className="space-y-1.5">
                  <FormTextarea
                    label="Allocation Justification / Treatment Explanation"
                    rows={2}
                    placeholder="e.g. Committed for orthopedic plate implants at Cessna Lifeline clinic..."
                    value={allocateDescription}
                    onChange={(e) => setAllocateDescription(e.target.value)}
                    required
                  />
                </div>

                {modalError && (
                  <p className="text-xs text-rose-700 font-semibold p-2 rounded-lg bg-rose-50 border border-rose-200">
                    {modalError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-grey-light">
                  <OutlineButton
                    size="sm"
                    type="button"
                    onClick={() => setShowAllocateModal(false)}
                    disabled={modalSubmitting}
                  >
                    Cancel
                  </OutlineButton>
                  <PrimaryButton size="sm" type="submit" isLoading={modalSubmitting}>
                    Confirm Allocation
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
};

export default AdminFundsPage;
