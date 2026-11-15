import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Award,
  Sparkles,
  Heart,
  ShieldCheck,
  LifeBuoy,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { getPublicLeaderboard } from '../services/api';
import Container from '../components/layout/Container';
import Section from '../components/layout/Section';
import BaseCard from '../components/cards/BaseCard';
import PrimaryButton from '../components/common/PrimaryButton';
import OutlineButton from '../components/common/OutlineButton';
import LoadingState from '../components/feedback/LoadingState';
import EmptyState from '../components/feedback/EmptyState';

export const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDonors, setTotalDonors] = useState(0);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPublicLeaderboard({ page, limit: 15 });
      if (data && data.success) {
        setLeaderboard(data.leaderboard || []);
        setTotalPages(data.totalPages || 1);
        setTotalDonors(data.totalDonors || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load public leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [page]);

  return (
    <Section spacing="default" className="py-8 sm:py-12 font-sans">
      <Container size="default">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest">
                Community Recognition
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-forest text-ivory font-medium">
                Public Honor Roll
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest">
              Donor Recognition Leaderboard
            </h1>
            <p className="text-xs text-charcoal-muted mt-1">
              Celebrating dedicated community members who support injured stray animals through verified simulated contributions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/donor/achievements">
              <OutlineButton size="sm" icon={Award}>
                My Badges
              </OutlineButton>
            </Link>
            <Link to="/cases">
              <PrimaryButton size="sm" icon={Heart}>
                Support a Rescue
              </PrimaryButton>
            </Link>
          </div>
        </div>

        {/* Global Academic & Privacy Notice */}
        <div className="rounded-2xl p-4 mb-8 bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-start gap-3 shadow-warm-xs">
          <AlertCircle className="w-5 h-5 text-amber-800 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="block text-sm font-serif font-bold text-amber-950">
              Academic Demonstration & Strict Privacy Protections
            </strong>
            <p className="leading-relaxed text-[11px]">
              All listed contributions and badge tallies are based on simulated academic demonstration data. In accordance with platform privacy safeguards, only donors who explicitly opt in through their dashboard settings appear on this leaderboard. Email addresses, phone numbers, and private credentials are never disclosed.
            </p>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-16">
            <LoadingState
              message="Loading community honor roll..."
              subtext="Aggregating opt-in donor participation and milestone tallies"
            />
          </div>
        ) : error ? (
          <div className="py-12">
            <EmptyState icon={AlertCircle} title="Leaderboard Unavailable" description={error} />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Trophy}
              title="No Opted-In Donors Yet"
              description="Be the first supporter to opt into the public recognition leaderboard from your donor dashboard!"
              action={
                <Link to="/donor/dashboard#recognition-settings">
                  <PrimaryButton size="sm">Configure Privacy Settings</PrimaryButton>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-grey-light bg-white shadow-warm-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-ivory-warm border-b border-grey-light text-charcoal-muted uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4 font-semibold text-center w-16">Rank</th>
                      <th className="py-3.5 px-4 font-semibold">Donor Name / Alias</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Badges Earned</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Gifts Made</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Cases Supported</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Simulated Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-grey-light/60">
                    {leaderboard.map((donor) => {
                      const isTop3 = donor.rank <= 3;
                      const rankColors = {
                        1: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
                        2: 'bg-slate-100 text-slate-800 border-slate-300 font-bold',
                        3: 'bg-amber-50 text-amber-800 border-amber-200 font-bold',
                      };

                      return (
                        <tr
                          key={donor._id}
                          className="hover:bg-ivory-warm/40 transition-colors"
                        >
                          {/* Rank */}
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs border ${
                                isTop3
                                  ? rankColors[donor.rank]
                                  : 'bg-ivory text-charcoal-muted border-grey-light'
                              }`}
                            >
                              {donor.rank === 1 ? '🥇' : donor.rank === 2 ? '🥈' : donor.rank === 3 ? '🥉' : donor.rank}
                            </span>
                          </td>

                          {/* Donor Name & Badges Preview */}
                          <td className="py-4 px-4">
                            <div className="font-semibold text-forest text-sm">
                              {donor.displayName}
                            </div>
                            {donor.recentBadges && donor.recentBadges.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-1">
                                {donor.recentBadges.map((badge, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] px-2 py-0.5 rounded-full bg-sage/20 text-forest font-medium"
                                  >
                                    {badge.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>

                          {/* Badges Count */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center gap-1 font-semibold text-forest">
                              <Award className="w-3.5 h-3.5 text-sage-dark" />
                              {donor.badgesCount}
                            </span>
                          </td>

                          {/* Donation Count */}
                          <td className="py-4 px-4 text-center">
                            <span className="font-semibold text-charcoal">
                              {donor.donationCount}
                            </span>
                          </td>

                          {/* Unique Cases Count */}
                          <td className="py-4 px-4 text-center text-charcoal-muted">
                            {donor.uniqueCasesCount} cases
                          </td>

                          {/* Simulated Total */}
                          <td className="py-4 px-4 text-right">
                            {donor.showsTotal ? (
                              <strong className="font-serif text-sm text-forest font-bold">
                                ₹{(donor.totalSimulatedAmount || 0).toLocaleString()}
                              </strong>
                            ) : (
                              <span className="text-[11px] text-charcoal-muted/70 italic flex items-center justify-end gap-1">
                                <EyeOff className="w-3 h-3" /> Hidden by user
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6 flex items-center justify-center gap-2">
                <OutlineButton
                  size="xs"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </OutlineButton>
                <span className="text-xs text-charcoal-muted px-2">
                  Page {page} of {totalPages}
                </span>
                <OutlineButton
                  size="xs"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </OutlineButton>
              </div>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
};

export default LeaderboardPage;
