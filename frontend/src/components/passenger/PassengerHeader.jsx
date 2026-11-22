import { Link, NavLink, useNavigate } from 'react-router-dom';
import Brand from '../ui/Brand.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { initials } from '../../lib/format.js';

const desktopLink =
  'relative flex h-16 items-center gap-1.5 px-1.5 text-[13.5px] transition after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full after:transition';
const desktopIdle = 'text-cream/70 hover:text-cream after:bg-transparent';
const desktopActive = 'text-white after:bg-accent';

export default function PassengerHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const isPassenger = user?.role === 'passenger';
  const isStaff = Boolean(user) && user.role !== 'passenger';
  const firstName = (user?.fullName || '').split(' ')[0];

  const desktopNav = [
    { to: '/search', label: 'Find trips', icon: '/icons/search.png' },
    ...(isPassenger
      ? [
          { to: '/passenger/bookings', label: 'My bookings' },
          { to: '/passenger/tickets', label: 'Tickets' },
        ]
      : []),
    { to: '/help', label: 'Help', icon: '/icons/help.png' },
  ];

  return (
    <header className="header-enter sticky top-0 z-30 bg-navy">
      <div className="flex h-16 items-center gap-6 px-4 sm:px-6 lg:gap-8 lg:px-8">
        {user ? (
          <div className="shrink-0" aria-hidden="true">
            <Brand />
          </div>
        ) : (
          <Link to="/" className="shrink-0" aria-label="SwiftBus home" replace>
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
  );
}
