import { useEffect } from 'react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import PassengerHeader from './PassengerHeader.jsx';
import Footer from './Footer.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

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

export default function PassengerLayout() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Start each passenger screen at the top instead of inheriting the previous scroll.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  const isPassenger = user?.role === 'passenger';

  // Signed-in passengers work inside the portal: the public home and help pages
  // are not part of it, so those URLs send them back to trip search.
  if (isPassenger && (pathname === '/' || pathname === '/help')) {
    return <Navigate to="/search" replace />;
  }

  // The signed-in passenger portal has no site footer; the public portal keeps it.
  const hideFooter = isPassenger;

  const mobileNav = isPassenger
    ? [
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
      <PassengerHeader />

      <main className="flex-1 pb-24 lg:pb-0">
        <Outlet />
      </main>

      {hideFooter ? null : <Footer />}

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
