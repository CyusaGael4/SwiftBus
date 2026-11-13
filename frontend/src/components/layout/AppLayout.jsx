import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-cream">
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
