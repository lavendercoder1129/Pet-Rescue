import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  LogOut,
  Users,
  UserCheck,
  ShieldAlert,
  RefreshCw,
  ClipboardCheck,
  Receipt,
  Sparkles,
  Megaphone,
  Award,
  Heart,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import StatCard from '../../components/cards/StatCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import StatusBadge from '../../components/feedback/StatusBadge';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import DashboardSidebar from '../../components/layout/DashboardSidebar';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [userFilter, setUserFilter] = useState('all'); // all, donor, rescuer, pending
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [dashRes, usersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
      ]);
      setStats(dashRes.data.stats);
      setUsersList(usersRes.data.users);
    } catch {
      // Backend test fallback if not populated
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyRescuer = async (rescuerId, newStatus) => {
    try {
      await api.patch(`/admin/rescuers/${rescuerId}/verify`, { status: newStatus });
      fetchAdminData();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    // Role / status filter
    if (userFilter === 'donor' && u.role !== 'donor') return false;
    if (userFilter === 'rescuer' && u.role !== 'rescuer') return false;
    if (userFilter === 'pending' && (u.role !== 'rescuer' || u.rescuerVerificationStatus !== 'pending')) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      return matchName || matchEmail;
    }
    return true;
  });

  const sidebarLinks = [
    { label: 'Control Center', path: '/admin/dashboard', icon: ShieldCheck, exact: true },
    { label: 'Review Cases', path: '/admin/cases', icon: ClipboardCheck, badge: stats?.pendingCases },
    { label: 'Fund Allocations', path: '/admin/funds', icon: Receipt },
    { label: 'Expense Claims', path: '/admin/expenses', icon: Receipt, badge: stats?.pendingExpenses },
    { label: 'Donations Overview', path: '/admin/donations', icon: Heart },
    { label: 'Updates Moderation', path: '/admin/rescue-updates', icon: Sparkles, badge: stats?.pendingUpdates },
    { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { label: 'Badges & Achievements', path: '/admin/achievements', icon: Award },
  ];

  return (
    <Section spacing="default" className="py-8 sm:py-12 font-sans">
      <Container size="default">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: 'Admin Control Center' }]} />

        {/* Top Bar with user greeting and Logout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-800 font-sans">
                Admin Control Center
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-700 text-white font-medium">
                System Administrator
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Welcome, {user?.name || 'Administrator'}
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 font-mono">
              Secure Session: {user?.email} • Admin Authority Cryptographically Verified
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <OutlineButton size="sm" icon={RefreshCw} onClick={fetchAdminData}>
              Refresh Metrics
            </OutlineButton>
            <OutlineButton size="sm" icon={LogOut} onClick={logout}>
              Log Out
            </OutlineButton>
          </div>
        </div>

        {/* Global Academic Disclosure */}
        <div className="rounded-2xl p-4.5 mb-8 bg-forest text-ivory flex items-start gap-3.5 shadow-warm-md">
          <ShieldCheck className="w-5 h-5 text-sage-light flex-shrink-0 mt-0.5" />
          <div className="text-xs text-sage-light leading-relaxed font-sans">
            <strong className="text-white font-semibold">Administrative Platform Oversight:</strong> You have accessed the administrative hub. All financial figures, donor contributions, fund allocations, and expense disbursements represent educational simulation data. Live banking channels are not integrated.
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Responsive Dashboard Sidebar */}
          <DashboardSidebar
            links={sidebarLinks}
            title="Administration"
            subtitle="Platform Governance"
          />

          {/* Main Dashboard Area */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* 1. Global Platform Overview Stats */}
            <div>
              <div className="mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-forest block">
                  Module Summary 1
                </span>
                <h2 className="font-serif text-xl font-bold text-forest">
                  Global Platform Overview
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Registered Users"
                  value={stats ? String(stats.totalUsers) : '...'}
                  subtitle={`${stats?.totalDonors || 0} donors, ${stats?.totalRescuers || 0} rescuers`}
                  colorScheme="forest"
                  icon={Users}
                />
                <StatCard
                  title="Rescue Cases"
                  value={stats ? String(stats.totalCases) : '...'}
                  subtitle={`${stats?.activeCases || 0} active, ${stats?.pendingCases || 0} pending`}
                  colorScheme="sage"
                  icon={ClipboardCheck}
                />
                <StatCard
                  title="Simulated Donations"
                  value={stats ? `₹${(stats.totalSimulatedDonations || 0).toLocaleString()}` : '...'}
                  subtitle={`${stats?.totalDonationsCount || 0} completed gifts`}
                  colorScheme="orange"
                  icon={Heart}
                />
                <StatCard
                  title="Allocated Funds"
                  value={stats ? `₹${(stats.totalAllocatedFunds || 0).toLocaleString()}` : '...'}
                  subtitle={`₹${(stats?.totalApprovedExpenses || 0).toLocaleString()} approved bills`}
                  colorScheme="charcoal"
                  icon={Receipt}
                />
              </div>
            </div>

            {/* 2. Three Management Hub Cards: Case Management, Rescuer Management & Financial Oversight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Case Management */}
              <BaseCard padding="md" className="bg-white border border-grey-light shadow-warm-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-grey-light">
                    <span className="text-xs font-bold text-forest uppercase tracking-wider">
                      Case Management
                    </span>
                    {stats?.pendingCases > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        {stats.pendingCases} Pending
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-base font-bold text-forest mt-2">
                    Case Verification Queue
                  </h3>
                  <div className="space-y-1.5 text-xs text-charcoal-muted mt-2">
                    <div className="flex justify-between">
                      <span>Approved Cases:</span>
                      <strong className="text-forest">{stats?.approvedCases || 0}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Reviews:</span>
                      <strong className="text-amber-800">{stats?.pendingCases || 0}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Rejected Cases:</span>
                      <strong className="text-rose-700">{stats?.rejectedCases || 0}</strong>
                    </div>
                  </div>
                </div>
                <Link to="/admin/cases" className="block pt-2">
                  <OutlineButton size="xs" className="w-full justify-between" icon={ClipboardCheck}>
                    Review Cases Queue
                  </OutlineButton>
                </Link>
              </BaseCard>

              {/* Rescuer Management */}
              <BaseCard padding="md" className="bg-white border border-grey-light shadow-warm-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-grey-light">
                    <span className="text-xs font-bold text-forest uppercase tracking-wider">
                      Rescuer Management
                    </span>
                    {stats?.pendingRescuers > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        {stats.pendingRescuers} Pending
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-base font-bold text-forest mt-2">
                    Rescuer Verifications
                  </h3>
                  <div className="space-y-1.5 text-xs text-charcoal-muted mt-2">
                    <div className="flex justify-between">
                      <span>Verified Rescuers:</span>
                      <strong className="text-forest">{stats?.verifiedRescuers || 0}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Verifications:</span>
                      <strong className="text-amber-800">{stats?.pendingRescuers || 0}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Rejected Applications:</span>
                      <strong className="text-rose-700">{stats?.rejectedRescuers || 0}</strong>
                    </div>
                  </div>
                </div>
                <a href="#users-management-section" className="block pt-2">
                  <OutlineButton size="xs" className="w-full justify-between" icon={UserCheck}>
                    Manage Rescuers Below
                  </OutlineButton>
                </a>
              </BaseCard>

              {/* Financial Management */}
              <BaseCard padding="md" className="bg-white border border-grey-light shadow-warm-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-grey-light">
                    <span className="text-xs font-bold text-forest uppercase tracking-wider">
                      Financial Oversight
                    </span>
                    {stats?.pendingExpenses > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        {stats.pendingExpenses} Claims
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-base font-bold text-forest mt-2">
                    Allocations & Bill Auditing
                  </h3>
                  <div className="space-y-1.5 text-xs text-charcoal-muted mt-2">
                    <div className="flex justify-between">
                      <span>Pending Bills:</span>
                      <strong className="text-amber-800">{stats?.pendingExpenses || 0}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved Bills:</span>
                      <strong className="text-forest">{stats?.approvedExpenses || 0}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Allocated Ledger:</span>
                      <strong className="text-forest">₹{(stats?.totalAllocatedFunds || 0).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Link to="/admin/funds" className="flex-1">
                    <OutlineButton size="xs" className="w-full justify-center">
                      Allocations
                    </OutlineButton>
                  </Link>
                  <Link to="/admin/expenses" className="flex-1">
                    <OutlineButton size="xs" className="w-full justify-center">
                      Expenses
                    </OutlineButton>
                  </Link>
                </div>
              </BaseCard>
            </div>

            {/* 3. Content Management Hub (Rescue Updates, Announcements, Badges) */}
            <BaseCard padding="lg" className="bg-white border border-grey-light shadow-warm-xs space-y-4">
              <div className="border-b border-grey-light pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-forest">
                  Content Governance
                </span>
                <h3 className="font-serif text-xl font-bold text-forest mt-0.5">
                  Content & Community Engagement
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-ivory-warm/60 border border-grey-light/60 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-xs font-serif font-bold text-forest block">
                        Clinical Updates Moderation
                      </strong>
                      {stats?.pendingUpdates > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                          {stats.pendingUpdates} pending
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-charcoal-muted">
                      Review progress journals submitted by rescuers before publication on public case timelines.
                    </p>
                  </div>
                  <Link to="/admin/rescue-updates">
                    <OutlineButton size="xs" icon={Sparkles} className="w-full">
                      Moderate Updates ({stats?.pendingUpdates || 0})
                    </OutlineButton>
                  </Link>
                </div>

                <div className="p-4 rounded-xl bg-ivory-warm/60 border border-grey-light/60 flex flex-col justify-between space-y-3">
                  <div>
                    <strong className="text-xs font-serif font-bold text-forest block">
                      Emergency Announcements
                    </strong>
                    <p className="text-[11px] text-charcoal-muted mt-1">
                      Broadcast natural disaster warnings, severe medical supply alerts, and site updates.
                    </p>
                  </div>
                  <Link to="/admin/announcements">
                    <OutlineButton size="xs" icon={Megaphone} className="w-full">
                      Manage Announcements ({stats?.announcementsCount || 0})
                    </OutlineButton>
                  </Link>
                </div>

                <div className="p-4 rounded-xl bg-ivory-warm/60 border border-grey-light/60 flex flex-col justify-between space-y-3">
                  <div>
                    <strong className="text-xs font-serif font-bold text-forest block">
                      Badges & Achievements
                    </strong>
                    <p className="text-[11px] text-charcoal-muted mt-1">
                      Configure badge criteria thresholds, icons, descriptions, and activation states.
                    </p>
                  </div>
                  <Link to="/admin/achievements">
                    <OutlineButton size="xs" icon={Award} className="w-full">
                      Manage Badges ({stats?.achievementsCount || 6})
                    </OutlineButton>
                  </Link>
                </div>
              </div>
            </BaseCard>

            {/* 4. User Management Section with Search, Role Filters & Rescuer Triage */}
            <BaseCard id="users-management-section" padding="lg" className="space-y-6 bg-white border border-grey-light shadow-warm-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-grey-light">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-forest">
                    Registered Users & Rescuer Governance
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    Admin directory of registered user accounts, roles, and rescuer verifications.
                  </p>
                </div>

                {/* Role Tabs */}
                <div className="flex items-center gap-1.5 bg-ivory-warm p-1 rounded-xl border border-grey-light text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setUserFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      userFilter === 'all' ? 'bg-forest text-white font-semibold shadow-warm-xs' : 'text-charcoal-soft hover:text-forest'
                    }`}
                  >
                    All ({usersList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserFilter('pending')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      userFilter === 'pending' ? 'bg-amber-600 text-white font-semibold shadow-warm-xs' : 'text-charcoal-soft hover:text-forest'
                    }`}
                  >
                    Pending Rescuers ({stats?.pendingRescuers || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserFilter('rescuer')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      userFilter === 'rescuer' ? 'bg-forest text-white font-semibold shadow-warm-xs' : 'text-charcoal-soft hover:text-forest'
                    }`}
                  >
                    Rescuers ({stats?.totalRescuers || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserFilter('donor')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      userFilter === 'donor' ? 'bg-forest text-white font-semibold shadow-warm-xs' : 'text-charcoal-soft hover:text-forest'
                    }`}
                  >
                    Donors ({stats?.totalDonors || 0})
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="max-w-md">
                <div className="relative">
                  <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-grey-light focus:outline-none focus:ring-2 focus:ring-forest/30 bg-ivory-warm/40"
                  />
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto rounded-xl border border-grey-light/60">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-sage-wash/50 text-forest border-b border-grey-light font-semibold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Rescuer Status</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4 text-right">Verification Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-grey-light/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-charcoal-muted">
                          No registered users match the selected criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-ivory-warm/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-charcoal">{u.name}</div>
                            <div className="text-[11px] font-mono text-charcoal-muted">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4 capitalize font-medium text-forest">
                            {u.role}
                          </td>
                          <td className="py-3.5 px-4">
                            {u.role === 'rescuer' ? (
                              <StatusBadge
                                status={
                                  u.rescuerVerificationStatus === 'approved'
                                    ? 'verified'
                                    : u.rescuerVerificationStatus === 'rejected'
                                    ? 'rejected'
                                    : 'pending'
                                }
                                label={u.rescuerVerificationStatus}
                              />
                            ) : (
                              <span className="text-[11px] text-charcoal-muted">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-charcoal-muted">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {u.role === 'rescuer' && (
                              <div className="flex items-center justify-end gap-1.5">
                                {u.rescuerVerificationStatus !== 'approved' && (
                                  <button
                                    type="button"
                                    onClick={() => handleVerifyRescuer(u._id, 'approved')}
                                    className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-semibold transition-colors"
                                  >
                                    Approve
                                  </button>
                                )}
                                {u.rescuerVerificationStatus !== 'rejected' && (
                                  <button
                                    type="button"
                                    onClick={() => handleVerifyRescuer(u._id, 'rejected')}
                                    className="px-2.5 py-1 rounded bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 text-[11px] font-semibold transition-colors"
                                  >
                                    Reject
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </BaseCard>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default AdminDashboard;
