import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { getAdminCases } from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import UrgencyBadge from '../../components/feedback/UrgencyBadge';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';

export const AdminCasesPage = () => {
  const [cases, setCases] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCases = useCallback(async (status = statusFilter) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminCases({ status });
      if (data && data.success) {
        setCases(data.cases || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve submitted cases for review.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchCases(statusFilter);
  }, [fetchCases, statusFilter]);

  const pendingCount = cases.filter((c) => c.verificationStatus === 'Pending').length;

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-800 font-sans">
                Admin Triage Queue
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-medium">
                {pendingCount} Pending Review
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Case Verification Review
            </h1>
            <p className="text-xs text-charcoal-muted mt-1">
              Audit rescuer injury submissions, verify veterinary estimates, and authorize campaigns for live public crowdfunding.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <OutlineButton size="sm" icon={RefreshCw} onClick={() => fetchCases(statusFilter)}>
              Refresh Queue
            </OutlineButton>

            <Link to="/admin/dashboard">
              <OutlineButton size="sm">
                Admin Center
              </OutlineButton>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-grey-light pb-4 mb-6 text-xs">
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-forest text-ivory shadow-warm-sm font-semibold'
                  : 'bg-white border border-grey-light text-charcoal-muted hover:text-forest'
              }`}
            >
              {status} Cases
            </button>
          ))}
        </div>

        {/* Content States */}
        {loading ? (
          <div className="py-16">
            <LoadingState
              message="Loading review queue..."
              subtext="Fetching submitted cases and rescuer verification metadata"
            />
          </div>
        ) : error ? (
          <div className="py-12">
            <EmptyState
              icon={AlertCircle}
              title="Queue Load Failed"
              description={error}
              action={
                <OutlineButton icon={RefreshCw} onClick={() => fetchCases(statusFilter)}>
                  Retry
                </OutlineButton>
              }
            />
          </div>
        ) : cases.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title={`No ${statusFilter === 'All' ? '' : statusFilter} Cases in Queue`}
              description="There are currently no cases matching this verification status."
            />
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl border border-grey-light shadow-warm-sm">
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
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        c.verificationStatus === 'Approved'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : c.verificationStatus === 'Rejected'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
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
        )}
      </Container>
    </Section>
  );
};

export default AdminCasesPage;
