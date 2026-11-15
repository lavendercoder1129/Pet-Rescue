import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Search,
  ArrowUpDown,
  Calendar,
  Eye,
  RefreshCw,
  AlertCircle,
  FileText,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';
import { getMyDonations } from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import StatCard from '../../components/cards/StatCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import FormInput from '../../components/forms/FormInput';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';

export const DonorDonationsPage = () => {
  const [donations, setDonations] = useState([]);
  const [summary, setSummary] = useState({
    totalSimulatedGiven: 0,
    uniqueCasesSupported: 0,
    totalDonationsCount: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyDonations({
        search: searchQuery,
        sort: sortBy,
        page,
        limit: 10,
      });

      if (data && data.success) {
        setDonations(data.donations || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve donation history.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, page]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDonations();
  };

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-muted font-sans">
                Donor Portal
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-forest text-ivory font-medium">
                Simulated Records
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              My Donation History
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 max-w-2xl font-sans">
              Review your contributions to emergency rescue cases, download simulated receipts, and monitor campaign milestones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <OutlineButton size="sm" icon={RefreshCw} onClick={fetchDonations}>
              Refresh Records
            </OutlineButton>

            <Link to="/cases">
              <PrimaryButton size="sm" icon={Heart} className="bg-orange-muted hover:bg-orange-hover">
                Support Another Case
              </PrimaryButton>
            </Link>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Simulated Given"
            value={`₹${summary.totalSimulatedGiven.toLocaleString()}`}
            subtitle="Academic demonstration value"
            colorScheme="forest"
            icon={Heart}
          />
          <StatCard
            title="Unique Rescues Supported"
            value={String(summary.uniqueCasesSupported)}
            subtitle="Distinct animal patients"
            colorScheme="orange"
            icon={FolderOpen}
          />
          <StatCard
            title="Simulated Transactions"
            value={String(summary.totalDonationsCount)}
            subtitle="Logged in verified database"
            colorScheme="sage"
            icon={FileText}
          />
        </div>

        {/* Search & Sort Controls */}
        <div className="bg-white rounded-2xl p-4 border border-grey-light shadow-warm-xs mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <FormInput
                type="text"
                placeholder="Search by case title, animal name, or ref (SIM-...)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
              <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-3.5" />
            </div>
            <PrimaryButton type="submit" size="sm" className="px-4 text-xs">
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

          <div className="flex items-center gap-2 text-xs">
            <span className="text-charcoal-muted flex items-center gap-1 flex-shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="bg-ivory-warm/60 border border-grey-light rounded-xl px-3 py-1.5 text-xs text-charcoal font-medium focus:ring-2 focus:ring-forest/20 focus:border-forest outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="amount_desc">Highest amount</option>
              <option value="amount_asc">Lowest amount</option>
            </select>
          </div>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="py-16">
            <LoadingState
              message="Loading your simulated donation records..."
              subtext="Retrieving entries from MongoDB"
            />
          </div>
        ) : error ? (
          <div className="py-12">
            <EmptyState
              icon={AlertCircle}
              title="Failed to Load Donations"
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
              icon={Heart}
              title="No Simulated Donations Found"
              description={
                searchQuery
                  ? 'No donation records matched your search query.'
                  : 'You have not made any simulated contributions yet. Support an emergency rescue case to see your receipt here.'
              }
              action={
                <Link to="/cases">
                  <PrimaryButton icon={Heart} className="bg-orange-muted hover:bg-orange-hover">
                    Explore Emergency Directory
                  </PrimaryButton>
                </Link>
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
                    <th className="p-4 font-semibold">Campaign & Animal</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Preference</th>
                    <th className="p-4 font-semibold">Status</th>
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
                        <div className="text-[11px] text-charcoal-muted flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-sage-dark" />
                          {new Date(d.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-serif font-bold text-sm text-forest truncate max-w-xs">
                          {d.rescueCase?.title || 'Rescue Case'}
                        </div>
                        <div className="text-[11px] text-charcoal-muted">
                          Patient: <strong>{d.rescueCase?.animalName}</strong> ({d.rescueCase?.location})
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-serif font-bold text-base text-forest">
                          ₹{d.amount.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-charcoal-muted">Simulated INR</span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            d.isAnonymous
                              ? 'bg-charcoal/10 text-charcoal'
                              : 'bg-sage-wash text-forest'
                          }`}
                        >
                          {d.isAnonymous ? 'Anonymous' : 'Public Name'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {d.transactionStatus}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <Link to={`/donation/success/${d._id}`}>
                          <PrimaryButton size="sm" icon={Eye} className="text-xs py-1.5 px-3">
                            View Receipt
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

export default DonorDonationsPage;
