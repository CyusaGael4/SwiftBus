import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function NotFoundPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
        404
      </p>
      <h1 className="mt-4 text-[32px] font-semibold text-navy">Page not found</h1>
      <p className="mt-3 max-w-sm text-[14px] text-muted">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        to={user ? (user.role === 'passenger' ? '/passenger/dashboard' : '/dashboard') : '/login'}
        className="mt-7 inline-flex h-[38px] items-center rounded-[4px] bg-accent px-5 text-[12.5px] font-medium text-white transition hover:bg-accent-dark"
      >
        {user
          ? user.role === 'passenger'
            ? 'Back to my dashboard'
            : 'Back to dashboard'
          : 'Back to sign in'}
      </Link>
    </div>
  );
}
