import { Link, NavLink, useNavigate } from 'react-router-dom';
import Brand from '../ui/Brand.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { initials } from '../../lib/format.js';

const desktopLink =
  'relative flex h-16 items-center gap-1.5 whitespace-nowrap px-1 text-[13.5px] transition after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full after:transition';
const desktopIdle = 'text-cream/70 hover:text-cream after:bg-transparent';
const desktopActive = 'text-white after:bg-accent';

export default function PassengerHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const isPassenger = user?.role === 'passenger';
  const isStaff = Boolean(user) && user.role !== 'passenger';
  const firstName = (user?.fullName || '').split(' ')[0];

  // Home and Help belong to the public portal only; a signed-in passenger lands
  // straight on their trips.
  const desktopNav = isPassenger
    ? [
        { to: '/passenger/dashboard', label: 'Dashboard', icon: '/icons/dashboard.png' },
        { to: '/search', label: 'Find trips', icon: '/icons/search.png' },
        {
          to: '/passenger/bookings',
          label: 'My bookings',
          icon: '/icons/booking.png',
          // This mark carries detail, so it runs a little larger than the
          // other nav icons to stay readable in the bar.
          iconClass: 'h-[19px] w-[19px]',
        },
        { to: '/passenger/tickets', label: 'Tickets', icon: '/icons/ticket.png' },
      ]
    : [
        { to: '/', label: 'Home', icon: '/icons/home.png', end: true },
        { to: '/search', label: 'Find trips', icon: '/icons/search.png' },
        { to: '/help', label: 'Help', icon: '/icons/help.png' },
      ];

  return (
    <header className="header-enter sticky top-0 z-30 bg-navy">
      {/* Phones show only the brand, so it is centred in the bar; the wider
          layout returns to the leading edge once the grid takes over. */}
      <div className="flex h-16 items-center justify-center gap-3 px-4 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:justify-normal lg:gap-6 lg:px-8">
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
            and the account controls sit on the trailing edge. Phones navigate
            from the bottom tab bar, so the header has no menu button. */}
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
                  className={`shrink-0 object-contain opacity-80 ${
                    item.iconClass || 'h-[15px] w-[15px]'
                  }`}
                />
              ) : null}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:ml-0 lg:flex lg:justify-self-end lg:gap-4">
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
                  to="/passenger/profile"
                  className="flex items-center gap-2 rounded-full border border-cream/20 py-1 pl-1 pr-3 transition hover:border-cream/40"
                  title="Your profile"
                  aria-label="Your profile"
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
                  onClick={() => {
                    signOut();
                    navigate('/', { replace: true });
                  }}
                  title="Sign out"
                  aria-label="Sign out"
                  className="hidden h-9 w-9 items-center justify-center rounded-full text-cream/55 transition hover:bg-white/10 hover:text-cream sm:inline-flex"
                >
                  <img
                    src="/icons/logout.png"
                    alt=""
                    aria-hidden="true"
                    className="h-[17px] w-[17px] object-contain opacity-80"
                  />
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
