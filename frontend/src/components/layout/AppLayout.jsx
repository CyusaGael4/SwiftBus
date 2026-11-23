import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // While the phone drawer is open the page behind it must not scroll, and a
  // tap on Escape should close it. The lock is released when the drawer closes
  // or when the viewport grows past the breakpoint that shows the fixed rail.
  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 1024px)');
    const handleDesktop = (event) => {
      if (event.matches) setSidebarOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    desktop.addEventListener('change', handleDesktop);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      desktop.removeEventListener('change', handleDesktop);
    };
  }, [sidebarOpen]);

  return (
    // The portal keeps every wide table inside its own scroller; this guard
    // stops the page itself from panning sideways on a phone.
    <div className="min-h-screen overflow-x-hidden bg-cream">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-navy/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen flex-col lg:pl-[212px]">
        <Topbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main
          key={location.pathname}
          className="flex-1 px-4 pb-10 pt-6 sm:px-5 lg:px-9 lg:pt-7"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
