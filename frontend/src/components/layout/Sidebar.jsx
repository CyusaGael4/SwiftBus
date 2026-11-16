import { NavLink } from 'react-router-dom';
import dashboardIcon from '../../assets/icons/dashboard.png';
import bookingIcon from '../../assets/icons/d_booking.png';
import busIcon from '../../assets/icons/bus.png';
import scheduleIcon from '../../assets/icons/schedule.png';
import routeIcon from '../../assets/icons/route.png';
import usersIcon from '../../assets/icons/users.png';
import logoutIcon from '../../assets/icons/logout.png';
import Brand from '../ui/Brand.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: dashboardIcon },
  { to: '/bookings', label: 'Bookings', icon: bookingIcon },
  { to: '/buses', label: 'Buses', icon: busIcon },
  { to: '/schedule', label: 'Schedule', icon: scheduleIcon },
  { to: '/routes', label: 'Routes', icon: routeIcon },
  { to: '/users', label: 'Users', icon: usersIcon },
];

export default function Sidebar({ open, onClose }) {
  const { signOut } = useAuth();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[78vw] max-w-[240px] flex-col bg-navy transition-transform duration-200 lg:w-[212px] lg:max-w-none lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="px-5 pb-10 pt-5 lg:pb-[72px]">
        <NavLink to="/dashboard" onClick={onClose} aria-label="SwiftBus dashboard">
          <Brand subtitle="Reservation system" />
        </NavLink>
      </div>

      <nav className="flex-1 space-y-2 px-2 lg:space-y-4">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `relative flex h-10 items-center gap-3 rounded-[4px] pl-2.5 pr-4 text-[15px] transition-colors ${
                isActive
                  ? 'bg-navy-light text-white'
                  : 'text-cream/80 hover:bg-white/[0.05] hover:text-cream'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <span className="absolute left-0 top-0 h-full w-[3px] rounded-r-sm bg-accent" />
                ) : null}
                <img
                  src={item.icon}
                  alt=""
                  className="h-5 w-5 shrink-0 object-contain"
                />
                <span className="font-normal leading-none">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 pb-6">
        <div className="mb-4 border-t border-white/15" />
        <button
          type="button"
          onClick={signOut}
          className="flex h-10 w-full items-center gap-3 rounded-[4px] pl-2.5 pr-4 text-[15px] text-cream/80 transition hover:bg-white/[0.05] hover:text-cream"
        >
          <img src={logoutIcon} alt="" className="h-5 w-5 shrink-0 object-contain" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
