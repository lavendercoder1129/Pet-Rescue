import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
  FileText,
  Users,
  Eye,
  Calendar,
} from 'lucide-react';
import { getAdminDonations, getAdminDonationStats } from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import StatCard from '../../components/cards/StatCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import FormInput from '../../components/forms/FormInput';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';

export const AdminDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalSimulatedAmount: 0,
    uniqueDonorsCount: 0,
    topCampaigns: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await getAdminDonationStats();
      if (data && data.success && data.stats) {
        setStats(data.stats);
      }
    } catch {
      // Non-blocking
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminDonations({
        search: searchQuery,
        status: statusFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 15,
      });

      if (data && data.success) {
        setDonations(data.donations || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load simulated donations ledger.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, startDate, endDate, page]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDonations();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setStartDate('');
    setEndDate('');
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
                Admin Financial Audit
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-forest text-ivory font-medium">
                Simulated Escrow
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Simulated Donations Overview
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 max-w-2xl font-sans">
              Audit all simulated donor pledges, inspect ledger entries by campaign, and review verified receipts. All statistics are demonstration data.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <OutlineButton
              size="sm"
              icon={RefreshCw}
              onClick={() => {
                fetchStats();
                fetchDonations();
              }}
            >
              Refresh Ledger
            </OutlineButton>

            <Link to="/admin/dashboard">
              <OutlineButton size="sm">Admin Center</OutlineButton>
            </Link>
          </div>
        </div>

        {/* Global Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Simulated Amount"
            value={statsLoading ? '...' : `₹${stats.totalSimulatedAmount.toLocaleString()}`}
            subtitle="Calculated from stored records"
            colorScheme="forest"
            icon={Heart}
          />
          <StatCard
            title="Total Donations"
            value={statsLoading ? '...' : String(stats.totalDonations)}
            subtitle="Recorded simulated pledges"
            colorScheme="orange"
            icon={FileText}
          />
          <StatCard
            title="Unique Donors"
            value={statsLoading ? '...' : String(stats.uniqueDonorsCount)}
            subtitle="Registered accounts"
            colorScheme="sage"
            icon={Users}
          />
          <StatCard
            title="Demonstration Status"
            value="100% Simulated"
            subtitle="No real banking or UPI"
            colorScheme="charcoal"
            icon={AlertCircle}
          />
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-grey-light shadow-warm-xs mb-6 space-y-4 font-sans text-xs">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <FormInput
                type="text"
                placeholder="Search by donation reference (SIM-)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
              <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-3.5" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-charcoal-muted whitespace-nowrap">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="p-2 rounded-xl bg-ivory-warm/60 border border-grey-light text-xs text-charcoal outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-charcoal-muted whitespace-nowrap">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="p-2 rounded-xl bg-ivory-warm/60 border border-grey-light text-xs text-charcoal outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <PrimaryButton type="submit" size="sm" className="px-4 text-xs">
                Filter
              </PrimaryButton>
              {(searchQuery || startDate || endDate || statusFilter !== 'All') && (
                <OutlineButton type="button" size="sm" onClick={handleClearFilters}>
                  Reset
                </OutlineButton>
              )}
            </div>
          </form>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="py-16">
            <LoadingState
              message="Loading simulated donations ledger..."
              subtext="Filtering records and computing audit aggregates"
            />
          </div>
        ) : error ? (
          <div className="py-12">
            <EmptyState
              icon={AlertCircle}
              title="Failed to Load Donations Ledger"
              description={error}
              action={
                <OutlineButton icon={RefreshCw} onClick={fetchDonations}>
                  Retry
                </OutlineButton>
              }
            />
          </div>
        ) : donations.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Filter}
              title="No Donations Found"
              description="There are currently no donation records matching your filter parameters."
              action={
                <OutlineButton onClick={handleClearFilters}>
                  Clear Search Filters
                </OutlineButton>
              }
            />
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            <div className="overflow-x-auto bg-white rounded-2xl border border-grey-light shadow-warm-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-grey-light text-charcoal-muted uppercase tracking-wider bg-ivory-warm/40">
                    <th className="p-4 font-semibold">Reference & Time</th>
                    <th className="p-4 font-semibold">Donor</th>
                    <th className="p-4 font-semibold">Campaign / Animal</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Status & Method</th>
                    <th className="p-4 font-semibold text-right">Receipt Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-light/60">
                  {donations.map((d) => (
                    <tr key={d._id} className="hover:bg-ivory-warm/30 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-xs text-forest">
                          {d.donationReference}
                        </div>
                        <div className="text-[11px] text-charcoal-muted mt-0.5">
                          {new Date(d.createdAt).toLocaleString()}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-charcoal">
                          {d.isAnonymous ? (
                            <span className="italic text-charcoal-muted">
                              {d.donor?.name || 'Anonymous'} (Marked Anonymous)
                            </span>
                          ) : (
                            d.donor?.name || 'Unknown'
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-charcoal-muted">{d.donor?.email}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-serif font-bold text-sm text-forest truncate max-w-xs">
                          {d.rescueCase?.title || 'Unknown Case'}
                        </div>
                        <div className="text-[11px] text-charcoal-muted">
                          Patient: {d.rescueCase?.animalName} ({d.rescueCase?.location})
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-serif font-bold text-base text-forest">
                          ₹{d.amount.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-charcoal-muted font-mono">INR Simulated</span>
                      </td>

                      <td className="p-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {d.transactionStatus}
                        </span>
                        <div className="text-[10px] text-charcoal-muted mt-0.5">{d.paymentMethod}</div>
                      </td>

                      <td className="p-4 text-right">
                        <Link to={`/donation/success/${d._id}`}>
                          <PrimaryButton size="sm" icon={Eye} className="text-xs py-1.5 px-3">
                            Audit Receipt
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
                  Showing {donations.length} of {totalCount} donations (Page {page} of {totalPages})
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

export default AdminDonationsPage;
