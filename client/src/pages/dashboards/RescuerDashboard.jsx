import { Link } from 'react-router-dom';
import { ShieldAlert, LogOut, PlusCircle, AlertCircle, Clock, FileCheck, FolderHeart, Receipt, FileText, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import BaseCard from '../../components/cards/BaseCard';
import StatCard from '../../components/cards/StatCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import OutlineButton from '../../components/common/OutlineButton';
import StatusBadge from '../../components/feedback/StatusBadge';

export const RescuerDashboard = () => {
  const { user, logout } = useAuth();
  const isVerified = user?.role === 'admin' || user?.rescuerVerificationStatus === 'approved';

  return (
    <Section spacing="default">
      <Container>
        {/* Top Bar with user greeting and Logout */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-grey-light mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-forest font-sans">
                Rescuer Portal
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
              Account ID: {user?._id} • Status: {user?.rescuerVerificationStatus}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/rescuer/cases">
              <OutlineButton size="sm" icon={FolderHeart}>
                My Submissions
              </OutlineButton>
            </Link>
            <Link to="/rescuer/updates">
              <OutlineButton size="sm" icon={Sparkles}>
                Rescue Updates
              </OutlineButton>
            </Link>
            <Link to="/rescuer/expenses">
              <OutlineButton size="sm" icon={Receipt}>
                My Expenses
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
                As a safety guardrail for animal welfare and donor funds, new Rescuer accounts must be reviewed by platform administrators before live rescue cases can be published.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-5 mb-8 bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3.5 shadow-warm-sm">
            <FileCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-sm">
                Rescuer Status: Approved & Active
              </strong>
              <p className="leading-relaxed">
                You are authorized to triage injured street animals and publish verified emergency campaigns.
              </p>
            </div>
          </div>
        )}

        {/* Rescuer Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            title="My Rescue Reports"
            value="Active"
            subtitle="Access case submissions"
            colorScheme="forest"
            icon={ShieldAlert}
          />
          <StatCard
            title="Verification Status"
            value={user?.rescuerVerificationStatus || 'pending'}
            subtitle="Admin review tier"
            colorScheme="orange"
            icon={Clock}
          />
          <StatCard
            title="Funds Disbursed"
            value="Simulated"
            subtitle="Against verified bills"
            colorScheme="sage"
            icon={FileCheck}
          />
          <StatCard
            title="Assigned Sector"
            value="Indiranagar"
            subtitle="Local trauma response"
            colorScheme="charcoal"
            icon={ShieldAlert}
          />
        </div>

        {/* Action and Case Management Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BaseCard padding="lg" className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-forest">
              Publish New Emergency Case
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed font-sans">
              Create an emergency case with GPS landmark, injury photos, admitting clinic contact, and preliminary veterinary surgery estimates.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {isVerified ? (
                <Link to="/rescuer/cases/new">
                  <PrimaryButton size="sm" icon={PlusCircle}>
                    Create Rescue Case
                  </PrimaryButton>
                </Link>
              ) : (
                <PrimaryButton size="sm" icon={PlusCircle} disabled>
                  Pending Verification Required
                </PrimaryButton>
              )}

              <Link to="/rescuer/cases">
                <OutlineButton size="sm">
                  View My Cases
                </OutlineButton>
              </Link>

              <Link to="/rescuer/expenses">
                <OutlineButton size="sm" icon={Receipt}>
                  Submit / View Expenses
                </OutlineButton>
              </Link>
            </div>
          </BaseCard>

          <BaseCard padding="lg" className="space-y-4">
            <h3 className="font-serif text-xl font-bold text-forest">
              Rescuer Profile & Identification
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
                <span className="text-charcoal-muted">Phone:</span>
                <span>{user?.phone || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-charcoal-muted">Role & Status:</span>
                <span className="capitalize font-semibold text-forest">
                  {user?.role} ({user?.rescuerVerificationStatus})
                </span>
              </div>
            </div>
          </BaseCard>
        </div>
      </Container>
    </Section>
  );
};

export default RescuerDashboard;
