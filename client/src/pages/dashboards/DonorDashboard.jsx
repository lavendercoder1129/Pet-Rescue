import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  LogOut,
  ArrowRight,
  ShieldCheck,
  History,
  Award,
  Sparkles,
  Settings,
  Eye,
  EyeOff,
  Trophy,
  CheckCircle2,
  LifeBuoy,
  Bell,
  Check,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getAvailableAchievements,
  getRecognitionSettings,
  updateRecognitionSettings,
  getMyDonations,
  getNotifications,
  markNotificationRead,
} from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import StatCard from '../../components/cards/StatCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import FormInput from '../../components/forms/FormInput';
import ProgressBar from '../../components/feedback/ProgressBar';
import Breadcrumbs from '../../components/layout/Breadcrumbs';
import DashboardSidebar from '../../components/layout/DashboardSidebar';

export const DonorDashboard = () => {
  const { user, logout } = useAuth();

  const [achievementData, setAchievementData] = useState(null);
  const [donationStats, setDonationStats] = useState({ totalAmount: 0, count: 0 });
  const [recentDonations, setRecentDonations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [privacySettings, setPrivacySettings] = useState({
    showOnLeaderboard: false,
    displayName: '',
    showDonationTotal: false,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [achRes, setRes, donRes, notifRes] = await Promise.all([
        getAvailableAchievements().catch(() => null),
        getRecognitionSettings().catch(() => null),
        getMyDonations({ limit: 5 }).catch(() => null),
        getNotifications().catch(() => null),
      ]);

      if (achRes && achRes.success) setAchievementData(achRes);
      if (setRes && setRes.success) setPrivacySettings(setRes.settings);
      if (donRes && donRes.success) {
        setDonationStats({
          totalAmount: donRes.stats?.totalAmount || 0,
          count: donRes.stats?.totalCount || 0,
        });
        setRecentDonations(donRes.donations || []);
      }
      if (notifRes && notifRes.success) {
        setNotifications((notifRes.notifications || []).slice(0, 5));
      }
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      setSettingsSuccess('');
      const res = await updateRecognitionSettings(privacySettings);
      if (res && res.success) {
        setSettingsSuccess('Recognition preferences saved successfully.');
        setTimeout(() => setSettingsSuccess(''), 4000);
      }
    } catch (err) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

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

  const earnedBadges = achievementData?.badges?.filter((b) => b.isEarned) || [];
  const lockedBadges = achievementData?.badges?.filter((b) => !b.isEarned) || [];
  // Next badge is first unearned badge
  const nextBadge = lockedBadges[0] || null;

  // Extract unique supported rescue cases
  const supportedCasesMap = new Map();
  recentDonations.forEach((d) => {
    if (d.rescueCase && d.rescueCase._id && !supportedCasesMap.has(d.rescueCase._id)) {
      supportedCasesMap.set(d.rescueCase._id, d.rescueCase);
    }
  });
  const supportedCases = Array.from(supportedCasesMap.values());

  const sidebarLinks = [
    { label: 'Overview', path: '/donor/dashboard', icon: Heart, exact: true },
    { label: 'Donation History', path: '/donor/donations', icon: History },
    { label: 'Achievement Badges', path: '/donor/achievements', icon: Award, badge: earnedBadges.length },
    { label: 'Browse Rescues', path: '/cases', icon: Search },
    { label: 'Public Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  return (
    <Section spacing="default" className="py-8 sm:py-12 font-sans">
      <Container size="default">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={[{ label: 'Donor Dashboard' }]} />

        {/* Top Bar with user greeting and Logout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-muted">
                Donor Portal
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-forest text-ivory font-medium">
                Verified Supporter
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Welcome, {user?.name || 'Supporter'}
            </h1>
            <p className="text-xs text-charcoal-muted mt-1 font-mono">
              Account ID: {user?._id} • Email: {user?.email}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link to="/donor/achievements">
              <OutlineButton size="sm" icon={Award}>
                My Badges
              </OutlineButton>
            </Link>
            <Link to="/donor/donations">
              <OutlineButton size="sm" icon={History}>
                My Donations
              </OutlineButton>
            </Link>
            <Link to="/cases">
              <PrimaryButton size="sm" icon={Heart}>
                Explore Rescues
              </PrimaryButton>
            </Link>
            <OutlineButton size="sm" icon={LogOut} onClick={logout}>
              Log Out
            </OutlineButton>
          </div>
        </div>

        {/* Global Academic Simulation Disclosure */}
        <div className="rounded-2xl p-4.5 mb-8 bg-sage-wash/70 border border-sage/40 flex items-start gap-3.5 shadow-warm-sm">
          <ShieldCheck className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
          <div className="text-xs text-forest leading-relaxed font-sans">
            <strong className="font-semibold block mb-0.5">Academic Demonstration Account:</strong>
            All contribution amounts, badges, and recognition totals are simulated for educational demonstration. No actual monetary transactions, banking transfers, or payment gateways are used.
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Responsive Dashboard Sidebar */}
          <DashboardSidebar
            links={sidebarLinks}
            title="Donor Portal"
            subtitle="Supporter Account"
          />

          {/* Main Dashboard Content Area */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Simulated Gifts"
                value={`₹${(donationStats.totalAmount || 0).toLocaleString()}`}
                subtitle={`${donationStats.count || 0} completed gifts`}
                colorScheme="orange"
                icon={Heart}
              />
              <StatCard
                title="Badges Earned"
                value={`${achievementData?.totalEarned || 0} / ${achievementData?.totalAvailable || 6}`}
                subtitle="Recognition badges unlocked"
                colorScheme="forest"
                icon={Award}
              />
              <StatCard
                title="Cases Supported"
                value={String(achievementData?.stats?.distinctCasesCount || 0)}
                subtitle="Unique animal rescues"
                colorScheme="sage"
                icon={LifeBuoy}
              />
              <StatCard
                title="Public Honor Roll"
                value={privacySettings.showOnLeaderboard ? 'Opted In' : 'Private'}
                subtitle="Community leaderboard tier"
                colorScheme="charcoal"
                icon={Trophy}
              />
            </div>

            {/* Next Available Achievement Progress Bar Banner */}
            {nextBadge && (
              <BaseCard padding="md" className="bg-gradient-to-r from-forest/5 via-sage-wash/40 to-ivory border border-sage/40 shadow-warm-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest text-ivory flex items-center justify-center flex-shrink-0 shadow-warm-xs">
                      <Sparkles className="w-5 h-5 text-sage-light" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-forest block">
                        Next Available Milestone
                      </span>
                      <strong className="text-sm font-serif font-bold text-forest">
                        {nextBadge.name}
                      </strong>
                      <p className="text-xs text-charcoal-muted mt-0.5">
                        {nextBadge.description}
                      </p>
                    </div>
                  </div>
                  <div className="sm:w-56 flex-shrink-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-charcoal-muted">{nextBadge.progressText}</span>
                      <span className="font-bold text-forest">{nextBadge.progressPercent}%</span>
                    </div>
                    <ProgressBar progress={nextBadge.progressPercent} size="sm" colorScheme="forest" />
                  </div>
                </div>
              </BaseCard>
            )}

            {/* Achievement Badges Spotlight Section */}
            <BaseCard padding="lg" className="bg-white border border-grey-light shadow-warm-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-grey-light pb-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-forest">
                    Milestone Recognition
                  </span>
                  <h3 className="font-serif text-xl font-bold text-forest mt-0.5">
                    Earned Achievement Badges
                  </h3>
                </div>
                <Link
                  to="/donor/achievements"
                  className="text-xs font-semibold text-forest hover:underline inline-flex items-center gap-1"
                >
                  View Full Collection ({achievementData?.totalAvailable || 6} Badges) <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {earnedBadges.length === 0 ? (
                <div className="p-6 rounded-xl bg-ivory-warm/40 border border-dashed border-grey-light text-center space-y-2">
                  <Award className="w-8 h-8 mx-auto text-charcoal-muted opacity-60" />
                  <p className="text-xs text-charcoal-muted max-w-md mx-auto">
                    Complete your first simulated donation to unlock the <strong>First Contribution</strong> badge!
                  </p>
                  <Link to="/cases">
                    <PrimaryButton size="xs" icon={Heart}>
                      Support a Rescue Case
                    </PrimaryButton>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {earnedBadges.map((badge) => (
                    <div
                      key={badge._id}
                      className="p-3.5 rounded-xl bg-ivory-warm/60 border border-grey-light/60 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-forest text-ivory flex items-center justify-center flex-shrink-0 shadow-warm-xs">
                        <Award className="w-5 h-5 text-sage-light" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <strong className="text-xs font-serif font-bold text-forest truncate block">
                          {badge.name}
                        </strong>
                        <span className="text-[11px] text-charcoal-muted truncate block">
                          {badge.description}
                        </span>
                        {badge.earnedAt && (
                          <span className="text-[10px] text-sage-dark font-medium block mt-0.5">
                            Unlocked {new Date(badge.earnedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BaseCard>

            {/* Two Column Grid: Donation History + Recently Supported Rescue Cases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Donation History with Dates, Amounts & Ref Numbers */}
              <BaseCard padding="lg" className="space-y-4 bg-white border border-grey-light shadow-warm-xs">
                <div className="flex items-center justify-between border-b border-grey-light pb-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-forest">
                      Simulated Donation History
                    </h3>
                    <p className="text-[11px] text-charcoal-muted">
                      Transactions with reference numbers & dates
                    </p>
                  </div>
                  <Link
                    to="/donor/donations"
                    className="text-xs font-semibold text-forest hover:underline"
                  >
                    View All
                  </Link>
                </div>

                {recentDonations.length === 0 ? (
                  <p className="text-xs text-charcoal-muted py-6 text-center">
                    No simulated donations recorded yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentDonations.map((d) => (
                      <div
                        key={d._id}
                        className="p-3 rounded-xl bg-ivory-warm/50 border border-grey-light/60 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <strong className="text-forest block truncate">
                            {d.rescueCase?.animalName || d.rescueCase?.title || 'Emergency Case'}
                          </strong>
                          <div className="text-[10px] text-charcoal-muted font-mono mt-0.5 truncate">
                            Ref: {d.donationReference} • {new Date(d.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-serif font-bold text-sm text-forest block">
                            ₹{d.amount.toLocaleString()}
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-forest/10 text-forest font-semibold">
                            {d.transactionStatus || 'Simulated'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </BaseCard>

              {/* Recently Supported Rescue Cases */}
              <BaseCard padding="lg" className="space-y-4 bg-white border border-grey-light shadow-warm-xs">
                <div className="flex items-center justify-between border-b border-grey-light pb-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-forest">
                      Supported Rescue Cases
                    </h3>
                    <p className="text-[11px] text-charcoal-muted">
                      Animals benefiting from your simulated pledges
                    </p>
                  </div>
                  <Link
                    to="/cases"
                    className="text-xs font-semibold text-forest hover:underline"
                  >
                    Browse All
                  </Link>
                </div>

                {supportedCases.length === 0 ? (
                  <div className="py-6 text-center space-y-2">
                    <p className="text-xs text-charcoal-muted">
                      You haven't supported any emergency rescue cases yet.
                    </p>
                    <Link to="/cases">
                      <OutlineButton size="xs" icon={Search}>
                        Find a Case in Need
                      </OutlineButton>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {supportedCases.map((rc) => (
                      <div
                        key={rc._id}
                        className="p-3 rounded-xl bg-ivory-warm/50 border border-grey-light/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <strong className="text-forest block truncate">
                            {rc.animalName || rc.title}
                          </strong>
                          <span className="text-[11px] text-charcoal-muted truncate block">
                            {rc.location || 'Local street shelter'} • {rc.urgencyLevel}
                          </span>
                        </div>
                        <Link
                          to={`/cases/${rc._id}`}
                          className="px-2.5 py-1 text-xs font-semibold text-forest bg-sage-wash hover:bg-sage/40 rounded-lg transition-colors flex items-center gap-1 flex-shrink-0"
                        >
                          Details <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </BaseCard>
            </div>

            {/* Two Column Grid: Recent Notifications + Privacy & Leaderboard Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Notifications */}
              <BaseCard padding="lg" className="space-y-4 bg-white border border-grey-light shadow-warm-xs">
                <div className="flex items-center justify-between border-b border-grey-light pb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-forest" />
                    <h3 className="font-serif text-xl font-bold text-forest">
                      Recent Notifications
                    </h3>
                  </div>
                  <span className="text-[10px] text-charcoal-muted">
                    In-app alerts
                  </span>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-xs text-charcoal-muted py-6 text-center">
                    No recent notifications.
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

              {/* Privacy & Public Recognition Settings (Module 10) */}
              <BaseCard
                id="recognition-settings"
                padding="lg"
                className="space-y-4 bg-white border border-grey-light shadow-warm-xs"
              >
                <div className="border-b border-grey-light pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-forest">
                      Leaderboard & Privacy Settings
                    </h3>
                    <p className="text-[11px] text-charcoal-muted mt-0.5">
                      Control your visibility on the public donor recognition leaderboard.
                    </p>
                  </div>
                  <Link
                    to="/leaderboard"
                    className="text-xs font-semibold text-forest hover:underline inline-flex items-center gap-1"
                  >
                    Leaderboard <Trophy className="w-3 h-3" />
                  </Link>
                </div>

                {settingsSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span>{settingsSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-ivory-warm/40 border border-grey-light/60">
                    <input
                      type="checkbox"
                      checked={privacySettings.showOnLeaderboard}
                      onChange={(e) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          showOnLeaderboard: e.target.checked,
                        }))
                      }
                      className="rounded border-grey-light text-forest focus:ring-forest mt-0.5"
                    />
                    <div>
                      <strong className="text-charcoal block">
                        Participate in Public Honor Roll Leaderboard
                      </strong>
                      <span className="text-[11px] text-charcoal-muted">
                        When disabled, you will not appear in public rankings.
                      </span>
                    </div>
                  </label>

                  {privacySettings.showOnLeaderboard && (
                    <>
                      <FormInput
                        label="Public Display Name / Alias"
                        placeholder="e.g. StrayHelperBangalore (defaults to your name)"
                        value={privacySettings.displayName}
                        onChange={(e) =>
                          setPrivacySettings((prev) => ({
                            ...prev,
                            displayName: e.target.value,
                          }))
                        }
                        maxLength={50}
                      />

                      <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl bg-ivory-warm/40 border border-grey-light/60">
                        <input
                          type="checkbox"
                          checked={privacySettings.showDonationTotal}
                          onChange={(e) =>
                            setPrivacySettings((prev) => ({
                              ...prev,
                              showDonationTotal: e.target.checked,
                            }))
                          }
                          className="rounded border-grey-light text-forest focus:ring-forest mt-0.5"
                        />
                        <div>
                          <strong className="text-charcoal block">
                            Display Simulated Contribution Total Publicly
                          </strong>
                          <span className="text-[11px] text-charcoal-muted">
                            If unchecked, your rank and badges appear while your total gift value is hidden.
                          </span>
                        </div>
                      </label>
                    </>
                  )}

                  <div className="pt-2 text-right">
                    <PrimaryButton size="xs" type="submit" disabled={savingSettings}>
                      {savingSettings ? 'Saving...' : 'Save Privacy Preferences'}
                    </PrimaryButton>
                  </div>
                </form>
              </BaseCard>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};

export default DonorDashboard;
