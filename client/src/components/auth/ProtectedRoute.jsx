import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../feedback/LoadingState';

/**
 * ProtectedRoute component
 * Redirects unauthenticated users to /login preserving the requested location.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <LoadingState
          message="Verifying session..."
          subtext="Checking cryptographic credentials"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
