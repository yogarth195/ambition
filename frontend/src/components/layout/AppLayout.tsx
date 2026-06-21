import React, { useState } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Sidebar } from './Sidebar';

const PAGE_META: Record<string, { title: string; crumb: string }> = {
  '/dashboard': { title: 'Dashboard', crumb: 'Dashboard' },
  '/reports': { title: 'Sole Report', crumb: 'Sole Report' },
  '/settings': { title: 'Settings', crumb: 'Settings' },
};

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] ?? { title: 'Production Manager', crumb: '…' };
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {/* Top bar */}
        <header className="h-16 shrink-0 bg-white border-b border-gray-100 px-8 flex items-center gap-2 text-sm">
          <NavLink to="/" className="text-gray-400 hover:text-gray-600 transition-colors text-xs">
            Home
          </NavLink>
          <ChevronRight className="h-3 w-3 text-gray-300" />
          <span className="text-gray-800 font-medium text-xs">{meta.crumb}</span>

          <div className="ml-auto" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-8 py-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
