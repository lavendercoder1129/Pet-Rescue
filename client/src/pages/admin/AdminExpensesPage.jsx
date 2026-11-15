import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Eye,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Calendar,
  FileText,
} from 'lucide-react';
import { getAdminExpenses } from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import StatCard from '../../components/cards/StatCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import FormInput from '../../components/forms/FormInput';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';

const CATEGORIES = [
  'Veterinary consultation',
  'Medicines',
  'Surgery',
  'Medical tests',
  'Food and nutrition',
  'Transportation',
  'Shelter',
  'Other',
];

export const AdminExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({
    totalSubmitted: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalApprovedSpending: 0,
  });
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminExpenses({
        status: statusFilter,
        category: categoryFilter,
        search: searchQuery,
        page,
        limit: 10,
      });

      if (data && data.success) {
        setExpenses(data.expenses || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve expenses for verification.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, searchQuery, page]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchExpenses();
  };

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest font-sans">
                Admin Expense Audit Center
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-forest text-ivory font-medium">
                Module 8 Live
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Expense Verification Dashboard
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 max-w-2xl font-sans">
              Audit clinical veterinary receipts, hospital surgery invoices, and pharmacy proof documents submitted by field rescuers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <OutlineButton size="sm" icon={RefreshCw} onClick={fetchExpenses}>
              Refresh Queue
            </OutlineButton>

            <Link to="/admin/dashboard">
              <OutlineButton size="sm">Admin Center</OutlineButton>
            </Link>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
          <StatCard
            title="Total Submitted"
            value={String(stats.totalSubmitted)}
            subtitle="All expense claims"
            colorScheme="forest"
            icon={Receipt}
          />
          <StatCard
            title="Pending Review"
            value={String(stats.pendingCount)}
            subtitle="Requires invoice audit"
            colorScheme="orange"
            icon={Clock}
          />
          <StatCard
            title="Approved Claims"
            value={String(stats.approvedCount)}
            subtitle="Verified spending"
            colorScheme="emerald"
            icon={CheckCircle2}
          />
          <StatCard
            title="Rejected Claims"
            value={String(stats.rejectedCount)}
            subtitle="Disallowed / revision"
            colorScheme="rose"
            icon={XCircle}
          />
          <StatCard
            title="Approved Spending"
            value={`₹${stats.totalApprovedSpending.toLocaleString()}`}
            subtitle="Verified against invoices"
            colorScheme="sage"
            icon={ShieldCheck}
          />
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-grey-light shadow-warm-xs mb-6 space-y-4 font-sans text-xs">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-forest text-ivory font-semibold shadow-warm-xs'
                      : 'bg-ivory-warm/70 text-charcoal-muted hover:text-forest'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-charcoal-muted">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-ivory-warm/60 border border-grey-light rounded-xl px-3 py-1.5 text-xs text-charcoal font-medium outline-none focus:ring-2 focus:ring-forest/20"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <FormInput
                type="text"
                placeholder="Search by expense title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
              <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-3.5" />
            </div>
            <PrimaryButton type="submit" size="sm" className="px-4">
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

        {/* Content States */}
        {loading ? (
          <div className="py-16">
            <LoadingState
              message="Loading expense claims queue..."
              subtext="Retrieving hospital invoices and rescuer verification metadata"
            />
          </div>
        ) : error ? (
          <div className="py-12">
            <EmptyState
              icon={AlertCircle}
              title="Queue Load Failed"
              description={error}
              action={
                <OutlineButton icon={RefreshCw} onClick={fetchExpenses}>
                  Retry
                </OutlineButton>
              }
            />
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Receipt}
              title={`No ${statusFilter === 'All' ? '' : statusFilter} Expenses Found`}
              description="There are currently no expenses matching your filter criteria in the audit queue."
            />
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            <div className="overflow-x-auto bg-white rounded-2xl border border-grey-light shadow-warm-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-grey-light text-charcoal-muted uppercase tracking-wider bg-ivory-warm/40">
                    <th className="p-4 font-semibold">Title & Date</th>
                    <th className="p-4 font-semibold">Rescue Case & Patient</th>
                    <th className="p-4 font-semibold">Rescuer</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-light/60">
                  {expenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-ivory-warm/30 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-forest text-sm">
                          {exp.title}
                        </div>
                        <div className="text-[11px] text-charcoal-muted flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-sage-dark" />
                          {new Date(exp.expenseDate).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-serif font-bold text-forest truncate max-w-xs">
                          {exp.rescueCase?.title || 'Case'}
                        </div>
                        <div className="text-[11px] text-charcoal-muted">
                          Patient: <strong>{exp.rescueCase?.animalName}</strong> ({exp.rescueCase?.location})
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-charcoal">{exp.submittedBy?.name || 'Rescuer'}</div>
                        <div className="text-[11px] font-mono text-charcoal-muted">{exp.submittedBy?.email}</div>
                      </td>

                      <td className="p-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-forest-subtle text-forest">
                          {exp.expenseCategory}
                        </span>
                      </td>

                      <td className="p-4">
                        <strong className="font-serif text-base text-forest">
                          ₹{exp.amount.toLocaleString()}
                        </strong>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            exp.verificationStatus === 'Approved'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : exp.verificationStatus === 'Rejected'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {exp.verificationStatus}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <Link to={`/admin/expenses/${exp._id}`}>
                          <PrimaryButton size="sm" icon={Eye} className="text-xs py-1.5 px-3">
                            Audit Claim
                          </PrimaryButton>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 pt-2 text-xs text-charcoal-muted font-sans">
                <span>
                  Showing {expenses.length} of {totalCount} claims (Page {page} of {totalPages})
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
      </Container>
    </Section>
  );
};

export default AdminExpensesPage;
