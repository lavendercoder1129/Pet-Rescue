import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  LogOut,
  PlusCircle,
  AlertCircle,
  Clock,
  FileCheck,
  FolderHeart,
  Receipt,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  Bell,
  Check,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getMyCases,
  getMyUpdates,
  getMyExpenses,
  getNotifications,
  markNotificationRead,
} from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import StatCard from '../../components/cards/StatCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import StatusBadge from '../../components/feedback/StatusBadge';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import DashboardSidebar from '../../components/layout/DashboardSidebar';

export const RescuerDashboard = () => {
  const { user, logout } = useAuth();
  const isVerified = user?.role === 'admin' || user?.rescuerVerificationStatus === 'approved';

  const [cases, setCases] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRescuerData = async () => {
    try {
      setLoading(true);
      const [casesRes, updatesRes, expRes, notifRes] = await Promise.all([
        getMyCases().catch(() => null),
        getMyUpdates().catch(() => null),
        getMyExpenses().catch(() => null),
        getNotifications().catch(() => null),
      ]);

      if (casesRes && casesRes.success) setCases(casesRes.cases || []);
      if (updatesRes && updatesRes.success) setUpdates(updatesRes.updates || []);
      if (expRes && expRes.success) setExpenses(expRes.expenses || []);
      if (notifRes && notifRes.success) setNotifications((notifRes.notifications || []).slice(0, 5));
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRescuerData();
  }, []);

  const handleMarkNotifRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Non-blocking
    }
  };

  // Case counts
  const totalCases = cases.length;
  const approvedCases = cases.filter((c) => c.verificationStatus === 'Approved').length;
  const pendingCases = cases.filter((c) => c.verificationStatus === 'Pending').length;
  const rejectedCases = cases.filter((c) => c.verificationStatus === 'Rejected').length;
  const activeCases = cases.filter((c) => c.campaignStatus === 'Active' && c.verificationStatus === 'Approved').length;

  // Expenses counts
  const pendingExpenses = expenses.filter((e) => e.verificationStatus === 'Pending').length;
  const approvedExpenses = expenses.filter((e) => e.verificationStatus === 'Approved').length;
  const rejectedExpenses = expenses.filter((e) => e.verificationStatus === 'Rejected').length;

  // Feedback from admin (cases with review notes or rejected updates/expenses)
  const casesWithFeedback = cases.filter((c) => c.reviewNotes && c.reviewNotes.trim());
  const updatesWithFeedback = updates.filter((u) => u.adminReviewNote && u.adminReviewNote.trim());
  const expensesWithFeedback = expenses.filter((e) => e.reviewNotes && e.reviewNotes.trim());

  const sidebarLinks = [
    { label: 'Overview', path: '/rescuer/dashboard', icon: FolderHeart, exact: true },
    { label: 'Submit New Case', path: '/rescuer/cases/new', icon: PlusCircle },
    { label: 'My Rescue Cases', path: '/rescuer/cases', icon: FolderHeart, badge: totalCases },
    { label: 'Post Update', path: '/rescuer/updates/new', icon: Sparkles },
    { label: 'Updates Journal', path: '/rescuer/updates', icon: FileCheck, badge: updates.length },
    { label: 'Submit Expense', path: '/rescuer/expenses/new', icon: PlusCircle },
    { label: 'My Expense Claims', path: '/rescuer/expenses', icon: Receipt, badge: expenses.length },
  ];

  return (
    <Section spacing="default" className="py-8 sm:py-12 font-sans">
      <Container size="default">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: 'Rescuer Dashboard' }]} />

        {/* Top Bar with user greeting and Logout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest font-sans">
                Rescuer Intake Portal
              </span>
              <StatusBadge
                status={isVerified ? 'verified' : 'pending'}
                label={isVerified ? 'Approved Rescuer' : 'Verification Pending'}
              />
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Welcome, {user?.name || 'Rescuer'}
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 font-mono">
              Account ID: {user?._id} • Verification Status: {user?.rescuerVerificationStatus}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {isVerified && (
              <Link to="/rescuer/cases/new">
                <PrimaryButton size="sm" icon={PlusCircle}>
                  Report Emergency Case
                </PrimaryButton>
              </Link>
            )}
            <Link to="/rescuer/updates/new">
              <OutlineButton size="sm" icon={Sparkles}>
                Publish Update
              </OutlineButton>
            </Link>
            <Link to="/rescuer/expenses/new">
              <OutlineButton size="sm" icon={Receipt}>
                Submit Expense
              </OutlineButton>
            </Link>
            <OutlineButton size="sm" icon={LogOut} onClick={logout}>
              Log Out
            </OutlineButton>
          </div>
        </div>

        {/* Verification Status Banner */}
        {!isVerified ? (
          <div className="rounded-2xl p-5 mb-8 bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-start gap-3.5 shadow-warm-sm">
            <AlertCircle className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-semibold block text-sm">
                Account Status: Pending Administrative Verification
              </strong>
              <p className="leading-relaxed">
                As a safety guardrail for animal welfare and donor transparency, new Rescuer accounts must be reviewed by platform administrators before emergency rescue cases can be published publicly.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-5 mb-8 bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3.5 shadow-warm-sm">
            <FileCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-sm">
                Rescuer Authorization: Approved & Active
              </strong>
              <p className="leading-relaxed">
                You are authorized to triage injured street animals, publish progress updates, and submit treatment expense claims against allocated campaign funds.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Responsive Dashboard Sidebar */}
          <DashboardSidebar
            links={sidebarLinks}
            title="Rescuer Portal"
            subtitle="Field Operations"
          />

          {/* Main Dashboard Area */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Rescuer Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Submitted Cases"
                value={String(totalCases)}
                subtitle={`${activeCases} active campaigns`}
                colorScheme="forest"
                icon={FolderHeart}
              />
              <StatCard
                title="Approved Cases"
                value={String(approvedCases)}
                subtitle={`${pendingCases} pending review`}
                colorScheme="sage"
                icon={CheckCircle2}
              />
              <StatCard
                title="Clinical Updates"
                value={String(updates.length)}
                subtitle="Published recovery milestones"
                colorScheme="orange"
                icon={Sparkles}
              />
              <StatCard
                title="Expense Submissions"
                value={String(expenses.length)}
                subtitle={`${pendingExpenses} pending, ${approvedExpenses} approved`}
                colorScheme="charcoal"
                icon={Receipt}
              />
            </div>

            {/* Quick Actions Card */}
            <BaseCard padding="lg" className="bg-white border border-grey-light shadow-warm-xs space-y-4">
              <div className="border-b border-grey-light pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-forest">
                  Field Operations
                </span>
                <h3 className="font-serif text-xl font-bold text-forest mt-0.5">
                  Quick Actions & Intake
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-ivory-warm/60 border border-grey-light/60 flex flex-col justify-between space-y-3">
                  <div>
                    <strong className="text-xs font-serif font-bold text-forest block">
                      1. Report Rescue Case
                    </strong>
                    <p className="text-[11px] text-charcoal-muted mt-1">
                      Document street animal trauma with photo proof, GPS location, and vet surgery cost estimates.
                    </p>
                  </div>
                  {isVerified ? (
                    <Link to="/rescuer/cases/new">
                      <PrimaryButton size="xs" icon={PlusCircle} className="w-full">
                        Create Case
                      </PrimaryButton>
                    </Link>
                  ) : (
                    <span className="text-[10px] text-amber-700 italic block">
                      Verification required
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-ivory-warm/60 border border-grey-light/60 flex flex-col justify-between space-y-3">
                  <div>
                    <strong className="text-xs font-serif font-bold text-forest block">
                      2. Publish Clinical Update
                    </strong>
                    <p className="text-[11px] text-charcoal-muted mt-1">
                      Post recovery progress photos, surgery milestones, and veterinary updates for approved cases.
                    </p>
                  </div>
                  <Link to="/rescuer/updates/new">
                    <OutlineButton size="xs" icon={Sparkles} className="w-full">
                      Post Update
                    </OutlineButton>
                  </Link>
                </div>

                <div className="p-4 rounded-xl bg-ivory-warm/60 border border-grey-light/60 flex flex-col justify-between space-y-3">
                  <div>
                    <strong className="text-xs font-serif font-bold text-forest block">
                      3. Submit Expense Proof
                    </strong>
                    <p className="text-[11px] text-charcoal-muted mt-1">
                      Upload scanned veterinary invoices and bills against allocated campaign funds.
                    </p>
                  </div>
                  <Link to="/rescuer/expenses/new">
                    <OutlineButton size="xs" icon={Receipt} className="w-full">
                      Submit Expense
                    </OutlineButton>
                  </Link>
                </div>
              </div>
            </BaseCard>

            {/* Two Column Grid: My Recent Rescue Cases + Recent Recovery Updates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* My Recent Rescue Cases */}
              <BaseCard padding="lg" className="space-y-4 bg-white border border-grey-light shadow-warm-xs">
                <div className="flex items-center justify-between border-b border-grey-light pb-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-forest">
                      My Submitted Cases
                    </h3>
                    <p className="text-[11px] text-charcoal-muted">
                      Approval status and active campaign progress
                    </p>
                  </div>
                  <Link to="/rescuer/cases" className="text-xs font-semibold text-forest hover:underline">
                    View All ({cases.length})
                  </Link>
                </div>

                {cases.length === 0 ? (
                  <div className="py-6 text-center space-y-2">
                    <p className="text-xs text-charcoal-muted">
                      No rescue cases submitted yet.
                    </p>
                    {isVerified && (
                      <Link to="/rescuer/cases/new">
                        <PrimaryButton size="xs" icon={PlusCircle}>
                          Submit First Case
                        </PrimaryButton>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cases.slice(0, 5).map((c) => (
                      <div
                        key={c._id}
                        className="p-3 rounded-xl bg-ivory-warm/50 border border-grey-light/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <strong className="text-forest block truncate">
                            {c.animalName || c.title}
                          </strong>
                          <span className="text-[10px] text-charcoal-muted truncate block">
                            {c.injuryType} • Goal: ₹{c.fundraisingGoal?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              c.verificationStatus === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.verificationStatus === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {c.verificationStatus}
                          </span>
                          <Link
                            to={`/cases/${c._id}`}
                            className="p-1 text-charcoal-muted hover:text-forest"
                            title="View Case Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </BaseCard>

              {/* Recent Recovery Updates */}
              <BaseCard padding="lg" className="space-y-4 bg-white border border-grey-light shadow-warm-xs">
                <div className="flex items-center justify-between border-b border-grey-light pb-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-forest">
                      Recent Recovery Updates
                    </h3>
                    <p className="text-[11px] text-charcoal-muted">
                      Progress reports and milestone journals
                    </p>
                  </div>
                  <Link to="/rescuer/updates" className="text-xs font-semibold text-forest hover:underline">
                    View All ({updates.length})
                  </Link>
                </div>

                {updates.length === 0 ? (
                  <div className="py-6 text-center space-y-2">
                    <p className="text-xs text-charcoal-muted">
                      No clinical updates submitted yet.
                    </p>
                    <Link to="/rescuer/updates/new">
                      <OutlineButton size="xs" icon={Sparkles}>
                        Post First Update
                      </OutlineButton>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {updates.slice(0, 5).map((u) => (
                      <div
                        key={u._id}
                        className="p-3 rounded-xl bg-ivory-warm/50 border border-grey-light/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <strong className="text-forest block truncate">
                            {u.title}
                          </strong>
                          <span className="text-[10px] text-charcoal-muted truncate block">
                            Milestone: {u.updateType} • {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                            u.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </BaseCard>
            </div>

            {/* Two Column Grid: Expense Submissions & Review Statuses + Recent Admin Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Expense Submissions & Statuses */}
              <BaseCard padding="lg" className="space-y-4 bg-white border border-grey-light shadow-warm-xs">
                <div className="flex items-center justify-between border-b border-grey-light pb-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-forest">
                      Expense Claims Review Status
                    </h3>
                    <p className="text-[11px] text-charcoal-muted">
                      Proof bills submitted against case allocations
                    </p>
                  </div>
                  <Link to="/rescuer/expenses" className="text-xs font-semibold text-forest hover:underline">
                    View All ({expenses.length})
                  </Link>
                </div>

                {expenses.length === 0 ? (
                  <p className="text-xs text-charcoal-muted py-6 text-center">
                    No expense claims submitted yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {expenses.slice(0, 5).map((exp) => (
                      <div
                        key={exp._id}
                        className="p-3 rounded-xl bg-ivory-warm/50 border border-grey-light/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <strong className="text-forest block truncate">
                            {exp.title}
                          </strong>
                          <span className="text-[10px] text-charcoal-muted truncate block">
                            {exp.category} • ₹{exp.amount?.toLocaleString()}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                            exp.verificationStatus === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : exp.verificationStatus === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {exp.verificationStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </BaseCard>

              {/* Recent Admin Feedback & Review Notes */}
              <BaseCard padding="lg" className="space-y-4 bg-white border border-grey-light shadow-warm-xs">
                <div className="flex items-center justify-between border-b border-grey-light pb-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-forest">
                      Administrative Review Feedback
                    </h3>
                    <p className="text-[11px] text-charcoal-muted">
                      Admin guidance on cases, expenses, and updates
                    </p>
                  </div>
                </div>

                {casesWithFeedback.length === 0 && updatesWithFeedback.length === 0 && expensesWithFeedback.length === 0 ? (
                  <p className="text-xs text-charcoal-muted py-6 text-center">
                    No administrative feedback notes on file.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {casesWithFeedback.slice(0, 3).map((c) => (
                      <div key={c._id} className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <strong className="text-amber-950 font-serif font-bold">
                            Case Review: {c.animalName || c.title}
                          </strong>
                          <span className="text-[10px] font-semibold uppercase text-amber-800">
                            {c.verificationStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-900 leading-relaxed font-sans">
                          "{c.reviewNotes}"
                        </p>
                      </div>
                    ))}

                    {expensesWithFeedback.slice(0, 2).map((exp) => (
                      <div key={exp._id} className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <strong className="text-rose-950 font-serif font-bold">
                            Expense Note: {exp.title}
                          </strong>
                          <span className="text-[10px] font-semibold uppercase text-rose-800">
                            {exp.verificationStatus}
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-900 leading-relaxed font-sans">
                          "{exp.reviewNotes}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </BaseCard>
            </div>

            {/* In-app Notifications Section */}
            <BaseCard padding="lg" className="space-y-4 bg-white border border-grey-light shadow-warm-xs">
              <div className="flex items-center justify-between border-b border-grey-light pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-forest" />
                  <h3 className="font-serif text-xl font-bold text-forest">
                    Rescuer Notifications
                  </h3>
                </div>
                <span className="text-[10px] text-charcoal-muted">
                  System alerts and status triggers
                </span>
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs text-charcoal-muted py-4 text-center">
                  No notifications recorded.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`p-3 rounded-xl border text-xs transition-colors ${
                        notif.isRead
                          ? 'bg-ivory-warm/30 border-grey-light/50 text-charcoal-muted'
                          : 'bg-sage-wash/40 border-sage/40 text-charcoal shadow-warm-xs font-medium'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <strong className="text-forest block truncate">
                            {notif.title}
                          </strong>
                          <p className="text-[11px] text-charcoal-soft leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-charcoal-muted block font-mono">
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {!notif.isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkNotifRead(notif._id)}
                            className="text-[10px] font-semibold text-forest hover:text-forest-dark flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-sage/30 flex-shrink-0"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" /> Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BaseCard>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default RescuerDashboard;
