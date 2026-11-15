import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Sparkles,
  HeartHandshake,
  ShieldAlert,
  CalendarCheck,
  LifeBuoy,
  Lock,
  CheckCircle2,
  TrendingUp,
  ArrowLeft,
  Settings,
  Trophy,
} from 'lucide-react';
import { getAvailableAchievements } from '../../services/api';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import StatCard from '../../components/cards/StatCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import ProgressBar from '../../components/feedback/ProgressBar';
import LoadingState from '../../components/feedback/LoadingState';
import EmptyState from '../../components/feedback/EmptyState';

// Icon map helper
const ICON_MAP = {
  Sparkles: Sparkles,
  HeartHandshake: HeartHandshake,
  Award: Award,
  ShieldHeart: Award,
  CalendarCheck: CalendarCheck,
  LifeBuoy: LifeBuoy,
};

export const DonorAchievementsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAvailableAchievements();
        if (res && res.success) {
          setData(res);
        }
      } catch (err) {
        setError(err.message || 'Failed to load achievements.');
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  const badges = data?.badges || [];
  const filteredBadges =
    categoryFilter === 'all'
      ? badges
      : badges.filter((b) => b.category === categoryFilter);

  // Compute next achievable badge (closest progressPercent < 100)
  const nextBadge = [...badges]
    .filter((b) => !b.isEarned)
    .sort((a, b) => b.progressPercent - a.progressPercent)[0];

  return (
    <Section spacing="default" className="py-8 sm:py-12 font-sans">
      <Container size="default">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                to="/donor/dashboard"
                className="inline-flex items-center text-xs font-semibold text-charcoal-muted hover:text-forest transition-colors mr-2"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Dashboard
              </Link>
              <span className="text-xs font-semibold uppercase tracking-wider text-forest">
                Donor Recognition
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              My Achievement Badges
            </h1>
            <p className="text-xs text-charcoal-muted mt-1">
              Honoring your dedication to injured street animal rescues through simulated donor participation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/leaderboard">
              <OutlineButton size="sm" icon={Trophy}>
                Public Leaderboard
              </OutlineButton>
            </Link>
            <Link to="/donor/dashboard#recognition-settings">
              <OutlineButton size="sm" icon={Settings}>
                Privacy Settings
              </OutlineButton>
            </Link>
          </div>
        </div>

        {/* Global Academic Disclosure */}
        <div className="rounded-2xl p-4 mb-8 bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-3 shadow-warm-xs">
          <Award className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5 font-sans">
            <strong className="block text-sm font-serif font-bold text-amber-950">
              Academic Recognition System Notice
            </strong>
            <p className="leading-relaxed text-[11px]">
              Achievement badges and rankings celebrate participation in simulated rescue campaigns. Badges are purely digital recognition marks with no monetary value or commercial prizes.
            </p>
          </div>
        </div>

        {/* 4 Summary Stat KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Badges Earned"
            value={`${data?.totalEarned || 0} / ${data?.totalAvailable || 0}`}
            subtitle="Unlocked recognition"
            colorScheme="forest"
            icon={Award}
          />
          <StatCard
            title="Simulated Gifts"
            value={String(data?.stats?.totalDonationsCount || 0)}
            subtitle="Completed contributions"
            colorScheme="sage"
            icon={Sparkles}
          />
          <StatCard
            title="Cases Supported"
            value={String(data?.stats?.distinctCasesCount || 0)}
            subtitle="Unique animals helped"
            colorScheme="orange"
            icon={LifeBuoy}
          />
          <StatCard
            title="Active Months"
            value={String(data?.stats?.distinctMonthsCount || 0)}
            subtitle="Consistent monthly support"
            colorScheme="charcoal"
            icon={CalendarCheck}
          />
        </div>

        {/* Next Achievable Badge Spotlight Card */}
        {nextBadge && (
          <BaseCard padding="lg" className="mb-8 bg-gradient-to-r from-ivory-warm to-white border border-grey-light shadow-warm-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-forest/10 border border-forest/20 flex items-center justify-center text-forest flex-shrink-0">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-muted">
                      Up Next
                    </span>
                    <span className="text-xs text-charcoal-muted">
                      {nextBadge.progressPercent}% Completed
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-forest">
                    {nextBadge.name}
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    {nextBadge.description}
                  </p>
                </div>
              </div>

              <div className="min-w-[200px] space-y-1.5">
                <div className="flex justify-between text-xs text-charcoal font-medium">
                  <span>Current Progress</span>
                  <span className="font-semibold text-forest">{nextBadge.progressText}</span>
                </div>
                <ProgressBar
                  value={nextBadge.currentValue}
                  max={nextBadge.criteriaValue}
                  variant="emerald"
                  size="sm"
                />
              </div>
            </div>
          </BaseCard>
        )}

        {/* Category Filters */}
        <div className="flex items-center gap-2 mb-6 border-b border-grey-light pb-2 overflow-x-auto">
          {['all', 'milestone', 'frequency', 'diversity'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                categoryFilter === cat
                  ? 'bg-forest text-ivory shadow-warm-xs'
                  : 'text-charcoal-muted hover:text-charcoal hover:bg-grey-light/40'
              }`}
            >
              {cat === 'all' ? 'All Badges' : cat}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        {loading ? (
          <div className="py-16">
            <LoadingState
              message="Loading your achievement collection..."
              subtext="Evaluating simulated contribution criteria"
            />
          </div>
        ) : error ? (
          <div className="py-12">
            <EmptyState icon={ShieldAlert} title="Unable to Load" description={error} />
          </div>
        ) : filteredBadges.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Award}
              title="No Badges Found"
              description="No badges match the selected filter category."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBadges.map((badge) => {
              const IconComponent = ICON_MAP[badge.icon] || Award;
              const isEarned = badge.isEarned;

              return (
                <BaseCard
                  key={badge._id}
                  padding="lg"
                  className={`border transition-all flex flex-col justify-between ${
                    isEarned
                      ? 'bg-white border-grey-light shadow-warm-xs hover:shadow-warm-md'
                      : 'bg-ivory-warm/40 border-dashed border-grey-light opacity-80'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Badge Icon & Status Badge */}
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                          isEarned
                            ? 'bg-gradient-to-br from-forest to-forest-light text-ivory shadow-warm-sm'
                            : 'bg-grey-light text-charcoal-muted'
                        }`}
                      >
                        {isEarned ? (
                          <IconComponent className="w-7 h-7" />
                        ) : (
                          <Lock className="w-6 h-6 opacity-60" />
                        )}
                      </div>

                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                          isEarned
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-grey-light text-charcoal-muted'
                        }`}
                      >
                        {isEarned ? 'Earned' : 'Locked'}
                      </span>
                    </div>

                    {/* Badge Details */}
                    <div>
                      <h3
                        className={`font-serif text-lg font-bold ${
                          isEarned ? 'text-forest' : 'text-charcoal-soft'
                        }`}
                      >
                        {badge.name}
                      </h3>
                      <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Progress or Earned Date */}
                  <div className="pt-4 border-t border-grey-light/60 mt-4 text-xs">
                    {isEarned ? (
                      <div className="flex items-center justify-between text-emerald-900 font-medium">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          Unlocked
                        </span>
                        <span className="text-[11px] text-charcoal-muted">
                          {badge.earnedAt
                            ? new Date(badge.earnedAt).toLocaleDateString()
                            : 'Completed'}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] text-charcoal-muted">
                          <span>Progress</span>
                          <span className="font-semibold text-charcoal">{badge.progressText}</span>
                        </div>
                        <ProgressBar
                          value={badge.currentValue}
                          max={badge.criteriaValue}
                          variant="emerald"
                          size="xs"
                        />
                      </div>
                    )}
                  </div>
                </BaseCard>
              );
            })}
          </div>
        )}
      </Container>
    </Section>
  );
};

export default DonorAchievementsPage;
