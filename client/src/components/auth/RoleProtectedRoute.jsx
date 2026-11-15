import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../feedback/LoadingState';
import Container from '../layout/Container';
import Section from '../layout/Section';
import BaseCard from '../cards/BaseCard';
import PrimaryButton from '../common/PrimaryButton';

/**
 * RoleProtectedRoute component
 * Restricts access to users having specified roles.
 * Renders an access-denied page if role is insufficient.
 */
export const RoleProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <LoadingState
          message="Checking permissions..."
          subtext="Validating role authorizations"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Section spacing="default">
        <Container size="narrow">
          <BaseCard padding="lg" className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center shadow-warm-sm">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 font-sans">
                Access Denied (403)
              </span>
              <h2 className="font-serif text-3xl font-bold text-forest">
                Unauthorized Role Area
              </h2>
              <p className="text-sm text-charcoal-muted leading-relaxed font-sans max-w-md mx-auto">
                Your account is registered as a <strong className="text-forest capitalize">{user.role}</strong>. This dashboard section is strictly restricted to accounts with <strong className="text-forest">[{allowedRoles.join(', ')}]</strong> permissions.
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Link to={`/${user.role}/dashboard`}>
                <PrimaryButton icon={ArrowLeft}>
                  Return to My {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
                </PrimaryButton>
              </Link>
            </div>
          </BaseCard>
        </Container>
      </Section>
    );
  }

  return children;
};

export default RoleProtectedRoute;
