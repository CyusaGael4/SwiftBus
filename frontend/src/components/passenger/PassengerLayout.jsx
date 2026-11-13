import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import Brand from '../ui/Brand.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { initials } from '../../lib/format.js';

function SearchIcon({ active }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth={active ? 2 : 1.6} />
      <path
        d="m16 16 4 4"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

function TicketIcon({ active }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5v2a1.8 1.8 0 0 0 0 3.6v1.4a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 15.5v-1.4a1.8 1.8 0 0 0 0-3.6v-2Z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinejoin="round"
      />
      <path d="M10 6v12" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 2" />
    </svg>
  );
}

function QrIcon({ active }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth={active ? 2 : 1.6} />
      <rect x="14" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth={active ? 2 : 1.6} />
      <rect x="4" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth={active ? 2 : 1.6} />
      <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" fill="currentColor" />
    </svg>
  );
}

function UserIcon({ active }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth={active ? 2 : 1.6} />
      <path
        d="M5 19.5c.6-3.2 3.5-5 7-5s6.4 1.8 7 5"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

const desktopLink =
  'relative flex h-16 items-center text-[13.5px] transition after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full after:transition';
const desktopIdle = 'text-cream/70 hover:text-cream after:bg-transparent';
const desktopActive = 'text-white after:bg-accent';

export default function PassengerLayout() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();

  // Start each passenger screen at the top instead of inheriting the previous scroll.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  const isPassenger = user?.role === 'passenger';
  const isStaff = Boolean(user) && user.role !== 'passenger';
  const firstName = (user?.fullName || '').split(' ')[0];

  const desktopNav = [
    { to: '/search', label: 'Find trips' },
    ...(isPassenger
      ? [
          { to: '/passenger/bookings', label: 'My bookings' },
          { to: '/passenger/tickets', label: 'Tickets' },
        ]
      : []),
  ];

  const mobileNav = isPassenger
    ? [
        { to: '/search', label: 'Find trips', Icon: SearchIcon },
        { to: '/passenger/bookings', label: 'Bookings', Icon: TicketIcon },
        { to: '/passenger/tickets', label: 'Tickets', Icon: QrIcon },
        { to: '/passenger/profile', label: 'Profile', Icon: UserIcon },
      ]
    : [
        { to: '/search', label: 'Find trips', Icon: SearchIcon },
        { to: '/login', label: 'Sign in', Icon: UserIcon },
      ];

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-30 bg-navy">
        <div className="passenger-shell flex h-16 items-center gap-6">
          <div className="shrink-0">
            <Brand />
          </div>

          <nav className="hidden items-center gap-8 lg:flex">
            {desktopNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `${desktopLink} ${isActive ? desktopActive : desktopIdle}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {isStaff ? (
              <Link
                to="/dashboard"
                className="hidden rounded-[4px] border border-cream/20 px-2.5 py-1.5 text-[11.5px] font-medium text-cream/80 transition hover:bg-white/10 hover:text-cream sm:inline-flex"
              >
                Staff portal
              </Link>
            ) : null}

            {isPassenger ? (
              <>
                <NavLink
                  to="/passenger/profile"
                  className="flex items-center gap-2 rounded-full border border-cream/20 py-1 pl-1 pr-3 transition hover:border-cream/40"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[12px] font-semibold text-white">
                    {initials(user.fullName) || 'Me'}
                  </span>
                  <span className="hidden text-[12.5px] font-medium text-cream sm:block">
                    {firstName}
                  </span>
                </NavLink>
                <button
                  type="button"
                  onClick={signOut}
                  className="hidden text-[12px] text-cream/55 transition hover:text-cream sm:inline"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="shrink-0 whitespace-nowrap text-[12.5px] font-medium text-cream/85 transition hover:text-cream"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="hidden h-9 shrink-0 items-center whitespace-nowrap rounded-[4px] bg-accent px-3.5 text-[12.5px] font-semibold text-white transition hover:bg-accent/90 sm:inline-flex"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 lg:pb-0">
        <Outlet />
      </main>

      

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface lg:hidden">
        <div
          className={`mx-auto grid max-w-md ${
            mobileNav.length === 4 ? 'grid-cols-4' : 'grid-cols-2'
          }`}
        >
          {mobileNav.map(({ to, label, Icon, end }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 pb-2 pt-2.5 text-[10.5px] font-medium transition ${
                  isActive ? 'text-accent' : 'text-muted'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon active={isActive} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
