import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Brand from '../ui/Brand.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { initials } from '../../lib/format.js';

const desktopLink =
  'relative flex h-16 items-center gap-1.5 whitespace-nowrap px-1 text-[13.5px] transition after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full after:transition';
const desktopIdle = 'text-cream/70 hover:text-cream after:bg-transparent';
const desktopActive = 'text-white after:bg-accent';

const menuLink =
  'flex min-h-[46px] items-center justify-between gap-3 border-b border-cream/10 px-4 text-[13.5px] text-cream/85 transition last:border-b-0 hover:bg-white/[0.04] hover:text-cream';

export default function PassengerHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isPassenger = user?.role === 'passenger';
  const isStaff = Boolean(user) && user.role !== 'passenger';
  const firstName = (user?.fullName || '').split(' ')[0];

  const desktopNav = [
    { to: '/', label: 'Home', icon: '/icons/home.png', end: true },
    { to: '/search', label: 'Find trips', icon: '/icons/search.png' },
    ...(isPassenger
      ? [
          { to: '/passenger/bookings', label: 'My bookings' },
          { to: '/passenger/tickets', label: 'Tickets' },
        ]
      : []),
    { to: '/help', label: 'Help', icon: '/icons/help.png' },
  ];

  // Close the phone menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="header-enter sticky top-0 z-30 bg-navy">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-6 lg:px-8">
        {user ? (
          <div className="shrink-0" aria-hidden="true">
            <Brand />
          </div>
        ) : (
          <Link to="/" className="shrink-0" aria-label="SwiftBus home" replace>
            <Brand />
          </Link>
        )}

        {/* The mark stays on the leading edge, the links are centred in the bar
            and the account controls sit on the trailing edge. On phones the
            links collapse into the menu button instead. */}
        <nav className="hidden items-center gap-4 lg:flex lg:justify-self-center lg:gap-3 xl:gap-6">
          {desktopNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${desktopLink} ${isActive ? desktopActive : desktopIdle}`
              }
            >
              {item.icon ? (
                <img
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                  className="h-[15px] w-[15px] shrink-0 object-contain opacity-80"
                />
              ) : null}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-0 lg:justify-self-end lg:gap-4">
          <span aria-hidden="true" className="hidden h-5 w-px bg-cream/15 lg:block" />

          <div className="hidden items-center gap-3 lg:flex">
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

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-controls="passenger-mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="flex h-10 w-10 items-center justify-center rounded-[4px] text-cream transition hover:bg-white/10 lg:hidden"
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="m6 6 12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="passenger-mobile-menu"
          className="absolute inset-x-0 top-full border-t border-cream/10 bg-navy shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)] lg:hidden"
        >
          <nav aria-label="Passenger menu">
            {user ? (
              <p className="border-b border-cream/10 bg-white/[0.04] px-4 py-3 text-[11.5px] uppercase tracking-[0.1em] text-cream/55">
                {isPassenger ? `Signed in as ${firstName}` : 'Staff account'}
              </p>
            ) : null}

            <NavLink to="/" end className={menuLink}>
              Home
              <span aria-hidden="true" className="text-cream/35">
                →
              </span>
            </NavLink>

            <NavLink to="/search" className={menuLink}>
              Find trips
              <span aria-hidden="true" className="text-cream/35">
                →
              </span>
            </NavLink>

            {isPassenger ? (
              <>
                <NavLink to="/passenger/bookings" className={menuLink}>
                  My bookings
                  <span aria-hidden="true" className="text-cream/35">
                    →
                  </span>
                </NavLink>
                <NavLink to="/passenger/tickets" className={menuLink}>
                  Tickets
                  <span aria-hidden="true" className="text-cream/35">
                    →
                  </span>
                </NavLink>
              </>
            ) : null}

            <NavLink to="/help" className={menuLink}>
              Help
              <span aria-hidden="true" className="text-cream/35">
                →
              </span>
            </NavLink>

            {isStaff ? (
              <Link to="/dashboard" className={menuLink}>
                Staff portal
                <span aria-hidden="true" className="text-cream/35">
                  →
                </span>
              </Link>
            ) : null}

            {isPassenger ? (
              <>
                <NavLink to="/passenger/profile" className={menuLink}>
                  Profile
                  <span aria-hidden="true" className="text-cream/35">
                    →
                  </span>
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    navigate('/', { replace: true });
                  }}
                  className={`${menuLink} w-full text-left`}
                >
                  Sign out
                </button>
              </>
            ) : null}

            {!user ? (
              <div className="p-4">
                <Link
                  to="/login"
                  className="flex h-11 items-center justify-center rounded-[4px] bg-accent text-[13.5px] font-semibold text-white transition hover:bg-accent/90"
                >
                  Sign in
                </Link>
              </div>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
