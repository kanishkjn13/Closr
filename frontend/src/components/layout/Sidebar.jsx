import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Calendar, Users, MessageSquare, BarChart2, Bell, Settings, X, Zap, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
const navItems = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: Home },
    { name: 'Break It Lab', to: '/admin/break-it', icon: Zap },
    { name: 'Appointments', to: '/admin/appointments', icon: Calendar },
    { name: 'Patients', to: '/admin/patients', icon: Users },
    { name: 'Messages', to: '/admin/messages', icon: MessageSquare },
    { name: 'Analytics', to: '/admin/analytics', icon: BarChart2 },
    { name: 'Notifications', to: '/admin/notifications', icon: Bell, badgeKey: 'notifications' },
    { name: 'Settings', to: '/admin/settings', icon: Settings },
];
export const ClosrLogo = ({ className }) => (<div className={cn('flex items-center gap-2.5 select-none', className)}>
    {/* Closr organic leaf emblem */}
    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-closr-forest">
        <path d="M6 26C6 26 8 16 16 10C24 4 28 6 28 6C28 6 27 15 20 22C13 29 6 26 6 26Z" fill="#174F43"/>
        <path d="M10 23C13 19 18 15 24 11" stroke="#E2E9DF" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 17C17.5 19 19 20.5 21 21.5" stroke="#E2E9DF" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
    <span className="font-serif text-2xl font-bold tracking-tight text-closr-forest">
      Closr
    </span>
  </div>);
export const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(() => notificationService.getUnreadCount());
    useEffect(() => {
        return notificationService.subscribe(() => {
            setUnreadCount(notificationService.getUnreadCount());
        });
    }, []);
    const handleStaffSignOut = async () => {
        await logout();
        navigate('/admin/login');
    };
    return (<>
      {/* Mobile Backdrop */}
      {isOpen && (<div className="fixed inset-0 z-40 bg-closr-forest/20 backdrop-blur-sm lg:hidden transition-opacity" onClick={onClose} aria-hidden="true"/>)}

      {/* Sidebar Container */}
      <aside className={cn('fixed lg:sticky top-0 left-0 z-40 h-screen w-64 lg:w-[176px] shrink-0 flex flex-col justify-between p-5 lg:px-3.5 lg:py-6 bg-closr-bg border-r border-closr-border/80 transition-transform duration-200 ease-in-out', isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
        <div className="space-y-7">
          {/* Logo & Mobile Close */}
          <div className="flex items-center justify-between px-2">
            <ClosrLogo />
            <button onClick={onClose} aria-label="Close navigation" className="p-1 rounded-lg hover:bg-closr-sage/50 text-closr-text-muted hover:text-closr-text lg:hidden">
              <X className="w-5 h-5"/>
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1" aria-label="Main Navigation">
            {navItems.map((item) => {
            const Icon = item.icon;
            const hasBadge = item.badgeKey === 'notifications' && unreadCount > 0;
            return (<NavLink key={item.name} to={item.to} onClick={onClose} className={({ isActive }) => cn('flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 select-none closr-focus group', isActive
                    ? 'bg-closr-sage/60 text-closr-forest font-semibold'
                    : 'text-closr-text-muted hover:text-closr-text hover:bg-closr-sage/25')}>
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0 stroke-[1.8]"/>
                    <span className="truncate">{item.name}</span>
                  </div>

                  {hasBadge && (<span className="w-5 h-5 rounded-full bg-closr-danger text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                      {unreadCount}
                    </span>)}
                </NavLink>);
        })}
          </nav>
        </div>

        {/* Clinic & Receptionist Indicator + Patient Portal link + Sign Out */}
        <div className="pt-4 border-t border-closr-border/60 space-y-2">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-closr-card/80 border border-closr-border/50 text-xs">
            <span className="w-2 h-2 rounded-full bg-closr-success animate-pulse shrink-0"/>
            <div className="min-w-0">
              <p className="font-semibold text-closr-text truncate">{user?.name || 'Dr. Sharma'}</p>
              <p className="text-[10px] text-closr-text-muted capitalize truncate">{user?.role || 'Staff'}</p>
            </div>
          </div>
          <NavLink
            to="/patient/login"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-closr-sage/30 hover:bg-closr-sage/60 border border-closr-border/60 text-xs font-semibold text-closr-forest transition-colors"
          >
            <span>Patient Portal</span>
            <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-closr-border font-medium">Open &rarr;</span>
          </NavLink>
          <button
            type="button"
            onClick={handleStaffSignOut}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-closr-danger hover:bg-closr-danger-bg rounded-xl transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>);
};
