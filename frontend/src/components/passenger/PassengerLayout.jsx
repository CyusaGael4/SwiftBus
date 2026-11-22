import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Brand from '../ui/Brand.jsx';
import Footer from './Footer.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { initials } from '../../lib/format.js';

function HomeIcon({ active }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1v-8.5Z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

function TripsIcon({ active }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2.5" stroke="currentColor" strokeWidth={active ? 2 : 1.6} />
      <path d="M8 3.5v3M16 3.5v3M4 10h16" stroke="currentColor" strokeWidth={active ? 2 : 1.6} strokeLinecap="round" />
      <path d="M8.5 14h3M8.5 17h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HelpIcon({ active }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth={active ? 2 : 1.6} />
      <path
        d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .9-1 1.6v.4"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.6" r="0.9" fill="currentColor" />
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
  'relative flex h-16 items-center px-1.5 text-[13.5px] transition after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full after:transition';
const desktopIdle = 'text-cream/70 hover:text-cream after:bg-transparent';
const desktopActive = 'text-white after:bg-accent';

export default function PassengerLayout() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Start each passenger screen at the top instead of inheriting the previous scroll.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  const isPassenger = user?.role === 'passenger';
  const isStaff = Boolean(user) && user.role !== 'passenger';
  const firstName = (user?.fullName || '').split(' ')[0];

  const desktopNav = [
    { to: '/', label: 'Home', end: true },
    { to: '/search', label: 'Find trips' },
    ...(isPassenger
      ? [
          { to: '/passenger/bookings', label: 'My bookings' },
          { to: '/passenger/tickets', label: 'Tickets' },
        ]
      : []),
    { to: '/help', label: 'Help' },
  ];

  const mobileNav = isPassenger
    ? [
        { to: '/', label: 'Home', Icon: HomeIcon, end: true },
        { to: '/search', label: 'Find trips', Icon: SearchIcon },
        { to: '/passenger/bookings', label: 'Bookings', Icon: TicketIcon },
        { to: '/passenger/dashboard', label: 'My trips', Icon: TripsIcon },
        { to: '/passenger/profile', label: 'Profile', Icon: UserIcon },
      ]
    : [
        { to: '/', label: 'Home', Icon: HomeIcon, end: true },
        { to: '/search', label: 'Find trips', Icon: SearchIcon },
        { to: '/help', label: 'Help', Icon: HelpIcon },
        { to: '/login', label: 'Sign in', Icon: UserIcon },
      ];

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="header-enter sticky top-0 z-30 bg-navy">
        <div className="passenger-shell flex h-16 items-center gap-6 lg:gap-8">
          {user ? (
            <div className="shrink-0" aria-hidden="true">
              <Brand />
            </div>
          ) : (
            <Link
              to="/"
              className="shrink-0"
              aria-label="SwiftBus home"
              replace
            >
              <Brand />
            </Link>
          )}

          {/* Links sit on the trailing edge, directly beside the account control,
              so the whole navigation reads as one right-aligned cluster. */}
          <div className="ml-auto flex items-center gap-5 lg:gap-7">
            <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
              {desktopNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `${desktopLink} ${isActive ? desktopActive : desktopIdle}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <span aria-hidden="true" className="hidden h-5 w-px bg-cream/15 lg:block" />

            <div className="flex items-center gap-3">
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
                    to="/passenger/dashboard"
                    className="flex items-center gap-2 rounded-full border border-cream/20 py-1 pl-1 pr-3 transition hover:border-cream/40"
                    title="Your trips"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[12px] font-semibold text-white">
                      {initials(user.fullName) || 'Me'}
                    </span>
                    <span className="hidden text-[12.5px] font-medium text-cream sm:block">
                      {firstName}
                    </span>
                  </NavLink>
                  <Link
                    to="/passenger/profile"
                    className="hidden text-[12px] text-cream/70 transition hover:text-cream sm:inline"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      navigate('/', { replace: true });
                    }}
                    className="hidden text-[12px] text-cream/55 transition hover:text-cream sm:inline"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="group flex h-11 shrink-0 items-center gap-2 rounded-full text-[13px] font-medium text-cream/85 transition hover:text-cream"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-cream/25 transition group-hover:border-cream/50 group-hover:bg-white/5">
                    <img
                      src="/icons/user.png"
                      alt=""
                      aria-hidden="true"
                      className="h-4 w-4 object-contain brightness-0 invert opacity-90"
                    />
                  </span>
                  <span className="whitespace-nowrap">Sign in</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 lg:pb-0">
        <Outlet />
      </main>

      <Footer />

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface lg:hidden">
        <div
          className={`mx-auto grid max-w-md ${
            mobileNav.length === 5 ? 'grid-cols-5' : 'grid-cols-4'
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
