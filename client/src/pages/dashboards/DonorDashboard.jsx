import { Link } from 'react-router-dom';
import { Heart, LogOut, ArrowRight, ShieldCheck, History, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import StatCard from '../../components/cards/StatCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';

export const DonorDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <Section spacing="default">
      <Container>
        {/* Top Bar with user greeting and Logout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-orange-muted font-sans">
                Donor Dashboard
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
            <Link to="/cases">
              <PrimaryButton size="sm" icon={Heart}>
                Explore Active Rescues
              </PrimaryButton>
            </Link>
            <OutlineButton size="sm" icon={LogOut} onClick={logout}>
              Log Out
            </OutlineButton>
          </div>
        </div>

        {/* Foundation Notice for upcoming modules */}
        <div className="rounded-2xl p-4.5 mb-8 bg-sage-wash/70 border border-sage/40 flex items-start gap-3.5 shadow-warm-sm">
          <ShieldCheck className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
          <div className="text-xs text-forest leading-relaxed">
            <strong className="font-semibold">Module 3 Milestone Foundation:</strong> Your authenticated donor session is active and verified by MongoDB. Real-time donation history, simulated wallet receipts, and impact tracking will be connected in Module 4 (Simulated Donation System) and Module 7 (Donor Recognition).
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            title="Simulated Pledges"
            value="₹2,500"
            subtitle="Held in verified escrow"
            colorScheme="orange"
            icon={Heart}
          />
          <StatCard
            title="Cases Supported"
            value="3"
            subtitle="Bruno, Luna & Max"
            colorScheme="forest"
            icon={History}
          />
          <StatCard
            title="Discharged to Care"
            value="1"
            subtitle="Full recovery verified"
            colorScheme="sage"
            icon={ShieldCheck}
          />
          <StatCard
            title="Patron Tier"
            value="Guardian"
            subtitle="Recognized community ally"
            colorScheme="charcoal"
            icon={Award}
          />
        </div>

        {/* Placeholder Feature Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BaseCard padding="lg" className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-forest">
              My Supported Rescue Cases
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed font-sans">
              Track veterinary treatment milestones, medication updates, and audited clinic receipts for animals you have supported.
            </p>
            <div className="p-4 rounded-xl bg-ivory-warm border border-grey-light text-xs text-charcoal-muted">
              Sample Case: <strong>Bruno (Pelvic Fracture)</strong> — Sutures healing; next orthopedic checkup in 4 days.
            </div>
            <div className="pt-2">
              <Link to="/cases">
                <OutlineButton size="sm" icon={ArrowRight} iconPosition="right">
                  Browse Emergency Directory
                </OutlineButton>
              </Link>
            </div>
          </BaseCard>

          <BaseCard padding="lg" className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-forest">
              Account Profile & Security
            </h3>
            <div className="space-y-2 text-xs font-sans text-charcoal-soft">
              <div className="flex justify-between py-1.5 border-b border-grey-light/60">
                <span className="text-charcoal-muted">Full Name:</span>
                <span className="font-semibold">{user?.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-grey-light/60">
                <span className="text-charcoal-muted">Email:</span>
                <span className="font-mono">{user?.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-grey-light/60">
                <span className="text-charcoal-muted">Role:</span>
                <span className="capitalize font-semibold text-forest">{user?.role}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-charcoal-muted">Member Since:</span>
                <span>{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </BaseCard>
        </div>
      </Container>
    </Section>
  );
};

export default DonorDashboard;
