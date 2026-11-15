import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  Calendar,
  Eye,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
} from 'lucide-react';
import { getMyExpenses } from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import StatCard from '../../components/cards/StatCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
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

export const RescuerExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyExpenses({
        status: statusFilter,
        category: categoryFilter,
        page,
        limit: 10,
      });

      if (data && data.success) {
        setExpenses(data.expenses || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve your submitted expenses.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, page]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return (
    <Section spacing="default" className="py-8 sm:py-12">
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest font-sans">
                Rescuer Claims Center
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-forest text-ivory font-medium">
                Module 8 Live
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              My Submitted Expenses
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 max-w-2xl font-sans">
              Track clinical treatment invoices, review administrative verification feedback, and view approved disbursements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <OutlineButton size="sm" icon={RefreshCw} onClick={fetchExpenses}>
              Refresh
            </OutlineButton>

            <Link to="/rescuer/expenses/new">
              <PrimaryButton size="sm" icon={PlusCircle}>
                Submit Expense Proof
              </PrimaryButton>
            </Link>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl p-4 border border-grey-light shadow-warm-xs mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 font-sans text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-forest text-ivory font-semibold shadow-warm-xs'
                    : 'bg-ivory-warm/70 text-charcoal-muted hover:text-forest'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

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

        {/* Content States */}
        {loading ? (
          <div className="py-16">
            <LoadingState
              message="Loading your submitted expenses..."
              subtext="Retrieving hospital invoices and review statuses"
            />
          </div>
        ) : error ? (
          <div className="py-12">
            <EmptyState
              icon={AlertCircle}
              title="Failed to Load Expenses"
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
              description="You have not submitted any clinical expense proofs under this status."
              action={
                <Link to="/rescuer/expenses/new">
                  <PrimaryButton icon={PlusCircle}>
                    Submit Expense Proof
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
                    <th className="p-4 font-semibold">Title & Date</th>
                    <th className="p-4 font-semibold">Rescue Case & Patient</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Admin Feedback</th>
                    <th className="p-4 font-semibold text-right">Documents</th>
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
                          Incurred: {new Date(exp.expenseDate).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-serif font-bold text-forest truncate max-w-xs">
                          {exp.rescueCase?.title || 'Case'}
                        </div>
                        <div className="text-[11px] text-charcoal-muted">
                          Patient: <strong>{exp.rescueCase?.animalName}</strong>
                        </div>
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

                      <td className="p-4 max-w-xs">
                        {exp.reviewNote ? (
                          <div
                            className={`p-2 rounded-lg text-[11px] leading-relaxed ${
                              exp.verificationStatus === 'Rejected'
                                ? 'bg-rose-50 text-rose-900 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                            }`}
                          >
                            <strong>Reviewer Note:</strong> {exp.reviewNote}
                          </div>
                        ) : (
                          <span className="text-charcoal-muted italic text-[11px]">
                            {exp.verificationStatus === 'Pending' ? 'In Admin Review Queue' : 'No note recorded'}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {exp.proofDocuments?.map((doc, idx) => (
                            <a
                              key={doc._id || idx}
                              href={doc.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded-lg bg-ivory-warm hover:bg-forest hover:text-ivory border border-grey-light text-[10px] font-medium transition-colors inline-flex items-center gap-1"
                              title={`View ${doc.originalName}`}
                            >
                              <FileText className="w-3 h-3" />
                              <span>Doc {idx + 1}</span>
                            </a>
                          ))}
                        </div>
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
                  Showing {expenses.length} of {totalCount} expenses (Page {page} of {totalPages})
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

export default RescuerExpensesPage;
