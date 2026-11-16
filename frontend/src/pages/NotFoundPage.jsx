import { Link } from 'react-router-dom';
import Brand from '../components/ui/Brand.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function NotFoundPage() {
  const { user } = useAuth();

  const homeForUser = !user
    ? { to: '/', label: 'Back to home' }
    : user.role === 'passenger'
      ? { to: '/passenger/dashboard', label: 'Back to my trips' }
      : { to: '/dashboard', label: 'Back to dashboard' };

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="passenger-shell flex h-16 items-center">
        <Link to="/" aria-label="SwiftBus home" className="shrink-0">
          <Brand onLight />
        </Link>
      </header>

      <main className="passenger-shell flex flex-1 items-center py-10">
        <div className="relative w-full max-w-[720px]">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 right-0 select-none text-[110px] font-semibold leading-none tracking-[-0.05em] text-[#D8D6CB] sm:-top-14 sm:text-[150px]"
          >
            404
          </span>

          <p className="relative text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
            Page not found
          </p>
          <h1 className="relative mt-2 max-w-[13ch] text-[34px] font-semibold leading-[1.06] tracking-[-0.035em] text-navy sm:text-[46px]">
            This stop isn&apos;t on the route.
          </h1>
          <p className="relative mt-4 max-w-[46ch] text-[14px] leading-relaxed text-muted">
            The page you followed doesn&apos;t exist, or the link is out of date. Your
            bookings and tickets are unaffected - head back and pick up where you left
            off.
          </p>

          <div className="relative mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Link
              to={homeForUser.to}
              className="inline-flex h-12 items-center justify-center rounded-[4px] bg-accent px-6 text-[13.5px] font-semibold text-white transition hover:bg-accent/90"
            >
              {homeForUser.label}
            </Link>
            <Link
              to="/search"
              className="inline-flex h-12 items-center justify-center rounded-[4px] border border-navy/20 px-5 text-[13px] font-medium text-navy transition hover:border-navy/40"
            >
              Find a trip
            </Link>
            <Link
              to="/help"
              className="inline-flex h-12 items-center justify-center px-2 text-[13px] font-medium text-muted underline decoration-border underline-offset-4 transition hover:text-navy"
            >
              Help centre
            </Link>
          </div>

          <div className="relative mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-5 text-[12px] text-muted">
            <Link to="/terms" className="transition hover:text-navy hover:underline">
              Terms of use
            </Link>
            <Link to="/privacy" className="transition hover:text-navy hover:underline">
              Privacy policy
            </Link>
            <span className="text-muted/70">© {new Date().getFullYear()} SwiftBus</span>
          </div>
        </div>
      </main>
    </div>
  );
}
