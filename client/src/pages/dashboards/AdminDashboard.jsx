import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, LogOut, Users, UserCheck, ShieldAlert, RefreshCw, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import StatCard from '../../components/cards/StatCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import StatusBadge from '../../components/feedback/StatusBadge';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
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

  return (
    <Section spacing="default">
      <Container>
        {/* Top Bar with user greeting and Logout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-800 font-sans">
                Admin Control Center
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-700 text-white font-medium">
                System Administrator
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Welcome, {user?.name || 'Administrator'}
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 font-mono">
              Secure Session: {user?.email} • Admin Authority Verified
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/admin/donations">
              <OutlineButton size="sm">
                Donations Overview
              </OutlineButton>
            </Link>
            <Link to="/admin/cases">
              <PrimaryButton size="sm" icon={ClipboardCheck}>
                Review Emergency Cases
              </PrimaryButton>
            </Link>
            <OutlineButton size="sm" icon={RefreshCw} onClick={fetchAdminData}>
              Refresh Data
            </OutlineButton>
            <OutlineButton size="sm" icon={LogOut} onClick={logout}>
              Log Out
            </OutlineButton>
          </div>
        </div>

        {/* Foundation Notice for upcoming modules */}
        <div className="rounded-2xl p-4.5 mb-8 bg-forest text-ivory flex items-start gap-3.5 shadow-warm-md">
          <ShieldCheck className="w-5 h-5 text-sage-light flex-shrink-0 mt-0.5" />
          <div className="text-xs text-sage-light leading-relaxed">
            <strong className="text-white font-semibold">Module 3 Admin Authority Active:</strong> You have accessed the protected admin route verified cryptographically via JWT. Complete case triage approvals and expense auditing will be integrated in Module 5 and Module 6.
          </div>
        </div>

        {/* Admin Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            title="Total Registered Users"
            value={stats ? String(stats.totalUsers) : '...'}
            subtitle="Donors, rescuers & staff"
            colorScheme="forest"
            icon={Users}
          />
          <StatCard
            title="Registered Donors"
            value={stats ? String(stats.totalDonors) : '...'}
            subtitle="Platform supporters"
            colorScheme="sage"
            icon={UserCheck}
          />
          <StatCard
            title="Registered Rescuers"
            value={stats ? String(stats.totalRescuers) : '...'}
            subtitle="Field intake agents"
            colorScheme="orange"
            icon={ShieldAlert}
          />
          <StatCard
            title="Pending Verification"
            value={stats ? String(stats.pendingRescuers) : '...'}
            subtitle="Awaiting admin action"
            colorScheme="charcoal"
            icon={Users}
          />
        </div>

        {/* User Management Section */}
        <BaseCard padding="lg" className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-grey-light">
            <div>
              <h3 className="font-serif text-2xl font-bold text-forest">
                Registered Users Management
              </h3>
              <p className="text-xs text-charcoal-muted">
                Admin view of user accounts, roles, and rescuer verification statuses.
              </p>
            </div>
            <span className="text-xs font-mono text-charcoal-muted">
              {usersList.length} accounts found
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-charcoal-muted">
              Loading users list...
            </div>
          ) : usersList.length === 0 ? (
            <div className="py-8 text-center text-xs text-charcoal-muted">
              No users registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-grey-light text-charcoal-muted uppercase tracking-wider">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Rescuer Status</th>
                    <th className="pb-3 font-semibold">Registered</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-light/60">
                  {usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-ivory-warm/40 transition-colors">
                      <td className="py-3">
                        <div className="font-semibold text-charcoal">{u.name}</div>
                        <div className="text-[11px] font-mono text-charcoal-muted">{u.email}</div>
                      </td>
                      <td className="py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          u.role === 'admin'
                            ? 'bg-rose-100 text-rose-800'
                            : u.role === 'rescuer'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3">
                        {u.role === 'rescuer' ? (
                          <StatusBadge
                            status={u.rescuerVerificationStatus === 'approved' ? 'verified' : 'pending'}
                            label={u.rescuerVerificationStatus}
                          />
                        ) : (
                          <span className="text-charcoal-muted/60">—</span>
                        )}
                      </td>
                      <td className="py-3 text-charcoal-muted">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        {u.role === 'rescuer' && (
                          <div className="flex items-center justify-end gap-1.5">
                            {u.rescuerVerificationStatus !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleVerifyRescuer(u._id, 'approved')}
                                className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 font-medium"
                              >
                                Approve
                              </button>
                            )}
                            {u.rescuerVerificationStatus !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleVerifyRescuer(u._id, 'rejected')}
                                className="px-2 py-1 rounded bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 font-medium"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </BaseCard>
      </Container>
    </Section>
  );
};

export default AdminDashboard;
