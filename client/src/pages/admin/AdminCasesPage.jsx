import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  RefreshCw,
  AlertCircle,
  Search,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { getAdminCases, getAdminCaseStats } from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import FormInput from '../../components/forms/FormInput';
import UrgencyBadge from '../../components/feedback/UrgencyBadge';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';

export const AdminCasesPage = () => {
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState({
    totalCases: 0,
    pendingCases: 0,
    approvedCases: 0,
    rejectedCases: 0,
    criticalCases: 0,
  });
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await getAdminCaseStats();
      if (data && data.success && data.stats) {
        setStats(data.stats);
      }
    } catch {
      // Non-blocking for stats
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminCases({
        status: statusFilter,
        search: searchQuery,
        sort: sortBy,
        page,
        limit: 10,
      });
      if (data && data.success) {
        setCases(data.cases || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve submitted cases for review.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, sortBy, page]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCases();
  };

  const handleTabChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
  };

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest font-sans">
                Admin Verification Center
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-forest text-ivory font-medium">
                Module 5 Live
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Case Verification Review
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 max-w-2xl font-sans">
              Audit rescuer trauma submissions, verify veterinary estimates, record append-only audit decisions, and authorize crowdfunding campaigns.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <OutlineButton
              size="sm"
              icon={RefreshCw}
              onClick={() => {
                fetchStats();
                fetchCases();
              }}
            >
              Refresh Queue
            </OutlineButton>

            <Link to="/admin/dashboard">
              <OutlineButton size="sm">Admin Center</OutlineButton>
            </Link>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-grey-light shadow-warm-xs">
            <div className="flex items-center justify-between text-charcoal-muted mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total Cases</span>
              <FolderOpen className="w-4 h-4 text-forest" />
            </div>
            <div className="font-serif text-2xl font-bold text-forest">
              {statsLoading ? '...' : stats.totalCases}
            </div>
            <span className="text-[10px] text-charcoal-muted">All historical cases</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-warm-xs bg-amber-50/20">
            <div className="flex items-center justify-between text-amber-800 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-amber-700">
              {statsLoading ? '...' : stats.pendingCases}
            </div>
            <span className="text-[10px] text-amber-800">Requires review</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-emerald-200/80 shadow-warm-xs bg-emerald-50/20">
            <div className="flex items-center justify-between text-emerald-800 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Approved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-emerald-700">
              {statsLoading ? '...' : stats.approvedCases}
            </div>
            <span className="text-[10px] text-emerald-800">Live crowdfunding</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-rose-200/80 shadow-warm-xs bg-rose-50/20">
            <div className="flex items-center justify-between text-rose-800 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Rejected</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="font-serif text-2xl font-bold text-rose-700">
              {statsLoading ? '...' : stats.rejectedCases}
            </div>
            <span className="text-[10px] text-rose-800">Awaiting revision</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-terracotta/40 shadow-warm-xs bg-orange-50/20">
            <div className="flex items-center justify-between text-terracotta mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Critical Urgency</span>
              <AlertTriangle className="w-4 h-4 text-terracotta" />
            </div>
            <div className="font-serif text-2xl font-bold text-terracotta">
              {statsLoading ? '...' : stats.criticalCases}
            </div>
            <span className="text-[10px] text-terracotta">High priority trauma</span>
          </div>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="bg-white rounded-2xl p-4 border border-grey-light shadow-warm-xs mb-6 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
              {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleTabChange(status)}
                  className={`px-3.5 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-forest text-ivory shadow-warm-xs font-semibold'
                      : 'bg-ivory-warm/70 text-charcoal-muted hover:text-forest hover:bg-ivory-warm'
                  }`}
                >
                  {status} Cases
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-charcoal-muted flex items-center gap-1 flex-shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-ivory-warm/60 border border-grey-light rounded-xl px-3 py-1.5 text-xs text-charcoal font-medium focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="urgency">Highest urgency</option>
                <option value="updated">Recently updated</option>
              </select>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <FormInput
                type="text"
                placeholder="Search by case title, animal name, rescuer name, or location..."
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
              message="Loading review queue..."
              subtext="Filtering submitted cases and rescuer verification metadata"
            />
          </div>
        ) : error ? (
          <div className="py-12">
            <EmptyState
              icon={AlertCircle}
              title="Queue Load Failed"
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
              icon={Filter}
              title={`No ${statusFilter === 'All' ? '' : statusFilter} Cases Found`}
              description="There are currently no cases matching your search criteria or status filter."
              action={
                searchQuery ? (
                  <OutlineButton
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('All');
                      setPage(1);
                    }}
                  >
                    Reset Filters
                  </OutlineButton>
                ) : null
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto bg-white rounded-2xl border border-grey-light shadow-warm-xs">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-grey-light text-charcoal-muted uppercase tracking-wider bg-ivory-warm/40">
                    <th className="p-4 font-semibold">Animal & Title</th>
                    <th className="p-4 font-semibold">Urgency</th>
                    <th className="p-4 font-semibold">Rescuer</th>
                    <th className="p-4 font-semibold">Goal (₹)</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-light/60">
                  {cases.map((c) => (
                    <tr key={c._id} className="hover:bg-ivory-warm/30 transition-colors">
                      <td className="p-4">
                        <div className="font-serif font-bold text-sm text-forest">
                          {c.animalName} ({c.animalType})
                        </div>
                        <div className="text-xs text-charcoal truncate max-w-xs">{c.title}</div>
                        <div className="text-[11px] text-charcoal-muted font-mono">{c.location}</div>
                      </td>

                      <td className="p-4">
                        <UrgencyBadge level={c.urgencyLevel.toLowerCase()} />
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-charcoal">{c.createdBy?.name || 'Unknown'}</div>
                        <div className="text-[11px] font-mono text-charcoal-muted">{c.createdBy?.email}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-serif font-bold text-forest">
                          ₹{c.fundraisingGoal.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-charcoal-muted">
                          Cost: ₹{c.estimatedTreatmentCost.toLocaleString()}
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            c.verificationStatus === 'Approved'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : c.verificationStatus === 'Rejected'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {c.verificationStatus}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <Link to={`/admin/cases/${c._id}`}>
                          <PrimaryButton size="sm" icon={Eye} className="text-xs py-1.5 px-3">
                            Review Case
                          </PrimaryButton>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 pt-2 text-xs text-charcoal-muted font-sans">
                <span>
                  Showing {cases.length} of {totalCount} cases (Page {page} of {totalPages})
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

export default AdminCasesPage;
