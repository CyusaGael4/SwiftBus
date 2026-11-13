import { useEffect, useState } from 'react';

export default function HoldTimer({ expiresAt, className = '' }) {
  const [remaining, setRemaining] = useState(() =>
    expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : 0
  );

  useEffect(() => {
    if (!expiresAt) return undefined;

    setRemaining(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    const timer = setInterval(() => {
      setRemaining(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  if (!expiresAt) return null;

  const totalSeconds = Math.ceil(remaining / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  const expired = remaining <= 0;

  return (
    <p
      className={`flex items-center gap-1.5 text-[12px] ${expired ? 'text-[#A94A30]' : 'text-muted'} ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7.5V12l3 1.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {expired ? 'Seat hold expired' : `Seats held for ${minutes}:${seconds}`}
    </p>
  );
}
