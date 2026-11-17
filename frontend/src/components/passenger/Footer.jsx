import { Link } from 'react-router-dom';
import Brand from '../ui/Brand.jsx';

const PLAN_LINKS = [
  { to: '/search', label: 'Find a trip' },
  { to: '/passenger/bookings', label: 'My bookings' },
  { to: '/passenger/tickets', label: 'Tickets' },
  { to: '/help', label: 'Help centre' },
];

const LEGAL_LINKS = [
  { to: '/terms', label: 'Terms of use' },
  { to: '/privacy', label: 'Privacy policy' },
  { to: '/help', label: 'Refunds & cancellations' },
];

const linkClass =
  'inline-flex min-h-[32px] items-center text-[12.5px] text-cream/65 transition hover:text-cream hover:underline hover:decoration-cream/30 hover:underline-offset-4';

const headingClass =
  'text-[10.5px] font-semibold uppercase tracking-[0.12em] text-cream/45';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1B1E33] lg:mt-8">
      <div className="passenger-shell">
        <div className="grid gap-3 py-3 md:grid-cols-2 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-6">
          <div>
            <Link to="/" aria-label="SwiftBus home" className="inline-flex">
              <Brand />
            </Link>
            <p className="mt-4 max-w-[32ch] text-[12.5px] leading-relaxed text-cream/55">
              Online seat reservations for coaches leaving Nyabugogo, with a QR
              ticket for every passenger and fares paid on board.
            </p>
            <p className="mt-4 text-[11.5px] leading-relaxed text-cream/40">
              Reservations desk · Nyabugogo bus park, Kigali
            </p>
          </div>

          <nav aria-labelledby="footer-plan">
            <h2 id="footer-plan" className={headingClass}>
              Plan
            </h2>
            <ul className="mt-2">
              {PLAN_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-legal">
            <h2 id="footer-legal" className={headingClass}>
              Policies
            </h2>
            <ul className="mt-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={headingClass}>Contact</h2>
            <address className="mt-2 text-[12.5px] not-italic leading-relaxed text-cream/55">
              <a
                href="mailto:support@swiftbus.rw"
                className="inline-flex min-h-[32px] items-center font-medium text-cream underline decoration-cream/30 underline-offset-4 transition hover:text-accent hover:decoration-accent"
              >
                support@swiftbus.rw
              </a>
              <p className="mt-1.5 text-[11.5px] text-cream/45">
                Counter bookings and refunds are handled at the departures desk.
              </p>
            </address>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="passenger-shell flex flex-col gap-2 pb-3 pt-3 text-[10px] text-cream/45 sm:flex-row sm:items-center sm:justify-between lg:pb-2">
          <p>© {year} SwiftBus. All rights reserved.</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex min-h-[32px] w-fit items-center gap-1.5 text-[11.5px] font-medium text-cream/60 transition hover:text-cream"
          >
            Back to top
            <span aria-hidden="true">↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
