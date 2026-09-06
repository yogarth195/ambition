import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Settings, LogOut, BarChart3, Factory,
  Scissors, Sparkles, Wrench, Package, Layers,  Wallet, Receipt,
  PanelLeftClose, PanelLeftOpen, HelpCircle, X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/production', label: 'Production',  icon: Factory         },
  { to: '/help',       label: 'Help',        icon: HelpCircle      },
  { to: '/settings',   label: 'Settings',    icon: Settings        },
];

const entryItems = [
  { to: '/trimmer',  label: 'Trimmer',   icon: Scissors     },
  { to: '/buffing',  label: 'Buffing',   icon: Sparkles     },
  { to: '/repair',   label: 'Repair',    icon: Wrench       },
  { to: '/packed',   label: 'Packed',    icon: Package      },
  { to: '/quantity', label: 'Quantity',  icon: Layers       },
  { to: '/labour',   label: 'Labour',    icon: Wallet       },
  { to: '/misc',     label: 'Misc',      icon: Receipt      },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const initials = user?.name?.slice(0, 2).toUpperCase() ?? 'U';
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // The mobile drawer always renders fully expanded — "collapsed" is a
  // desktop-only concept. Without this, collapsing on desktop and then
  // opening the mobile drawer would render it icon-only inside a full-width
  // panel.
  const showCollapsed = collapsed && !mobileOpen;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'flex flex-col shrink-0 bg-slate-950 border-r border-white/5 transition-all duration-300 ease-in-out',
          // Mobile: fixed off-canvas drawer, full height, slides in/out.
          'fixed inset-y-0 left-0 z-40 w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: back in normal flow, width follows collapsed state.
          'lg:static lg:translate-x-0 lg:z-auto',
          showCollapsed ? 'lg:w-[68px]' : 'lg:w-64'
        )}
      >
        {/* Brand + Toggle */}
        <div className="flex items-center h-16 border-b border-white/5 px-3">
          <div className={cn('flex items-center gap-3 min-w-0', showCollapsed ? 'justify-center w-full' : 'px-2')}>
            <div className="h-7 w-7 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
              <BarChart3 className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            {!showCollapsed && (
              <div className="leading-tight min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">Sole Report</p>
                <p className="text-[11px] text-slate-500">Manager</p>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          {!showCollapsed && (
            <button
              onClick={onToggle}
              className="ml-auto hidden lg:block shrink-0 p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="ml-auto lg:hidden shrink-0 p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
            title="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Expand button when collapsed (desktop only) */}
        {showCollapsed && (
          <div className="flex justify-center py-2 border-b border-white/5">
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          {!showCollapsed && (
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">
              Navigation
            </p>
          )}
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/dashboard'} onClick={onMobileClose}>
              {({ isActive }) => (
                <div
                  className={cn(
                    'nav-link mb-0.5',
                    isActive ? 'nav-link-active' : 'nav-link-inactive',
                    showCollapsed && 'justify-center px-0'
                  )}
                  title={showCollapsed ? label : undefined}
                >
                  {/* Active indicator bar */}
                  <div
                    className={cn(
                      'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-amber-400 transition-opacity',
                      isActive ? 'opacity-100' : 'opacity-0'
                    )}
                    style={{ marginLeft: showCollapsed ? '-8px' : '-12px' }}
                  />
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive ? 'text-amber-400' : 'text-slate-500'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {!showCollapsed && (
                    <span className={cn('text-[13px]', isActive ? 'text-white' : 'text-slate-400')}>
                      {label}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}

          {!showCollapsed ? (
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mt-5 mb-2">
              Data Entry
            </p>
          ) : (
            <div className="my-3 mx-2 border-t border-white/5" />
          )}
          {entryItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onMobileClose}>
              {({ isActive }) => (
                <div
                  className={cn(
                    'nav-link mb-0.5',
                    isActive ? 'nav-link-active' : 'nav-link-inactive',
                    showCollapsed && 'justify-center px-0'
                  )}
                  title={showCollapsed ? label : undefined}
                >
                  <div
                    className={cn(
                      'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-amber-400 transition-opacity',
                      isActive ? 'opacity-100' : 'opacity-0'
                    )}
                    style={{ marginLeft: showCollapsed ? '-8px' : '-12px' }}
                  />
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive ? 'text-amber-400' : 'text-slate-500'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {!showCollapsed && (
                    <span className={cn('text-[13px]', isActive ? 'text-white' : 'text-slate-400')}>
                      {label}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-2 pb-4 border-t border-white/5 pt-3">
          {showCollapsed ? (
            /* Collapsed: just the avatar */
            <div className="flex justify-center py-1">
              <div className="h-7 w-7 rounded-full bg-amber-600 flex items-center justify-center shrink-0 text-[11px] font-bold text-white">
                {initials}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
              <div className="h-7 w-7 rounded-full bg-amber-600 flex items-center justify-center shrink-0 text-[11px] font-bold text-white">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white truncate leading-tight">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={cn(
              'w-full mt-1 flex items-center gap-3 py-2 rounded-lg text-[13px] text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-colors duration-150',
              showCollapsed ? 'justify-center px-0' : 'px-3'
            )}
            title={showCollapsed ? 'Sign out' : undefined}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {!showCollapsed && 'Sign out'}
          </button>
        </div>

        <ConfirmDialog
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={logout}
          title="Sign out"
          description="You'll need to log in again to access the dashboard."
          confirmLabel="Sign out"
          variant="danger"
        />
      </aside>
    </>
  );
};
