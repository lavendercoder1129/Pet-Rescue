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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getAvailableAchievements,
  getRecognitionSettings,
  updateRecognitionSettings,
  getMyDonations,
} from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import StatCard from '../../components/cards/StatCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import FormInput from '../../components/forms/FormInput';
import ProgressBar from '../../components/feedback/ProgressBar';

export const DonorDashboard = () => {
  const { user, logout } = useAuth();

  const [achievementData, setAchievementData] = useState(null);
  const [donationStats, setDonationStats] = useState({ totalAmount: 0, count: 0 });
  const [recentDonations, setRecentDonations] = useState([]);
  const [privacySettings, setPrivacySettings] = useState({
    showOnLeaderboard: false,
    displayName: '',
    showDonationTotal: false,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [achRes, setRes, donRes] = await Promise.all([
          getAvailableAchievements().catch(() => null),
          getRecognitionSettings().catch(() => null),
          getMyDonations({ limit: 3 }).catch(() => null),
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
      } catch {
        // Non-blocking
      }
    };

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

  const earnedBadges = achievementData?.badges?.filter((b) => b.isEarned) || [];
  const lockedBadges = achievementData?.badges?.filter((b) => !b.isEarned) || [];

  return (
    <Section spacing="default" className="py-8 sm:py-12 font-sans">
      <Container size="default">
        {/* Top Bar with user greeting and Logout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-muted">
                Donor Portal
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-forest text-ivory font-medium">
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

          <div className="flex items-center gap-3">
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
          <div className="text-xs text-forest leading-relaxed">
            <strong className="font-semibold block mb-0.5">Academic Demonstration Account:</strong>
            All contribution amounts, badges, and recognition totals are simulated for educational demonstration. No actual monetary transactions or bank transfers take place.
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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

        {/* Achievement Badges Spotlight Section */}
        <BaseCard padding="lg" className="mb-10 bg-white border border-grey-light shadow-warm-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-grey-light pb-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-forest">
                Milestone Recognition
              </span>
              <h3 className="font-serif text-xl font-bold text-forest mt-0.5">
                Earned Achievement Highlights
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
              {earnedBadges.slice(0, 3).map((badge) => (
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </BaseCard>

        {/* Recent Contributions & Privacy Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Recent Contributions */}
          <BaseCard padding="lg" className="space-y-4 bg-white border border-grey-light shadow-warm-xs">
            <div className="flex items-center justify-between border-b border-grey-light pb-3">
              <h3 className="font-serif text-xl font-bold text-forest">
                Recent Contributions
              </h3>
              <Link
                to="/donor/donations"
                className="text-xs font-semibold text-forest hover:underline"
              >
                View All
              </Link>
            </div>

            {recentDonations.length === 0 ? (
              <p className="text-xs text-charcoal-muted py-4 text-center">
                No simulated donations made yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentDonations.map((d) => (
                  <div
                    key={d._id}
                    className="p-3 rounded-xl bg-ivory-warm/50 border border-grey-light/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-forest block">
                        {d.rescueCase?.animalName || d.rescueCase?.title || 'Rescue Case'}
                      </strong>
                      <span className="text-[11px] text-charcoal-muted">
                        Ref: {d.donationReference} • {new Date(d.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="font-serif font-bold text-sm text-forest">
                      ₹{d.amount.toLocaleString()}
                    </span>
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
      </Container>
    </Section>
  );
};

export default DonorDashboard;
