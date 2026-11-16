import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Brand from '../ui/Brand.jsx';
import Spinner from '../ui/Spinner.jsx';

export function homeForRole(role) {
  return role === 'passenger' ? '/passenger/dashboard' : '/dashboard';
}

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-cream">
        <div className="rounded-[6px] bg-navy px-4 py-3">
          <Brand />
        </div>
        <Spinner size="lg" label="Opening your workspace" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }

  return <Outlet />;
}
