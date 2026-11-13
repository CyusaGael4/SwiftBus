import userIcon from '../../assets/icons/user.png';
import { useAuth } from '../../context/AuthContext.jsx';
import { roleLabel } from '../../lib/format.js';

export default function Topbar({ onOpenSidebar }) {
  const { user } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border px-5 lg:px-9">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="-ml-1 flex h-9 w-9 items-center justify-center rounded text-navy transition hover:bg-black/5 lg:hidden"
        aria-label="Open navigation"
      >
        <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
          <path
            d="M1 1H19M1 8H19M1 15H19"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="ml-auto flex min-w-0 items-center gap-2">
        <img src={userIcon} alt="" className="h-5 w-5 shrink-0 object-contain" />
        <div className="min-w-0 max-w-[140px] text-right leading-none sm:max-w-none">
          <p className="truncate text-[12px] font-semibold leading-[1.1] text-navy">
            {user?.fullName || 'SwiftBus staff'}
          </p>
          <p className="mt-[3px] truncate text-[9px] font-semibold uppercase leading-none tracking-[0.1em] text-muted">
            {roleLabel(user?.role)}
          </p>
        </div>
      </div>
    </header>
  );
}
