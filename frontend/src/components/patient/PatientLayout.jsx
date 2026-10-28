import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  MessageSquare, 
  User, 
  Home, 
  Bell, 
  LogOut, 
  ChevronDown, 
  AlertCircle,
  ExternalLink,
  X,
  Check
} from 'lucide-react';
import { usePatientAuth } from '../../context/PatientAuthContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { notificationService } from '../../services/notificationService';
import { cn } from '../../lib/utils';

export const PatientLayout = () => {
  const { currentPatient, logout: patientLogout } = usePatientAuth();
  const { user: authUser, logout: mainLogout } = useAuth();
  const activePatient = currentPatient || (authUser?.role === 'patient' ? authUser : null);
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications for the active patient
  useEffect(() => {
    const loadPatientNotifs = async () => {
      const patientId = activePatient?.id;
      if (!patientId) return;
      const all = await notificationService.getNotifications();
      const patientNotifs = all.filter((n) => n.relatedPatientId === patientId);
      setNotifications(patientNotifs);
    };

    loadPatientNotifs();
    const unsubscribe = notificationService.subscribe(loadPatientNotifs);
    return () => unsubscribe();
  }, [activePatient?.id]);

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const handleSignOut = async () => {
    if (mainLogout) await mainLogout();
    if (patientLogout) patientLogout();
    navigate('/patient/login');
  };

  const navItems = [
    { name: 'Overview', path: '/patient/dashboard', icon: Home },
    { name: 'My Appointments', path: '/patient/appointments', icon: Calendar },
    { name: 'Messages', path: '/patient/messages', icon: MessageSquare },
    { name: 'My Profile', path: '/patient/profile', icon: User },
  ];

  const handleMarkNotifRead = async (notifId) => {
    await notificationService.markAsRead(notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    for (const n of notifications) {
      if (!n.isRead) {
        await notificationService.markAsRead(n.id);
      }
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="min-h-screen bg-closr-bg text-closr-text flex flex-col font-sans">
      {/* 1. Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-closr-card/95 backdrop-blur-md border-b border-closr-border shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3">
            <NavLink to="/patient/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-closr-forest text-white flex items-center justify-center shadow-xs font-serif font-bold text-lg">
                C
              </div>
              <span className="font-serif font-bold text-lg text-closr-text tracking-tight group-hover:text-closr-forest transition-colors">
                Closr
              </span>
            </NavLink>
            <span className="text-closr-border-dark hidden sm:inline">|</span>
            <span className="hidden sm:inline-flex items-center text-xs font-medium text-closr-forest bg-closr-sage/50 px-2.5 py-0.5 rounded-full border border-closr-border">
              Patient Portal
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-closr-forest text-white shadow-xs'
                      : 'text-closr-text-muted hover:text-closr-text hover:bg-closr-sage/30'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Header Actions: Notifications & User Profile */}
          <div className="flex items-center gap-2.5">
            {/* Demo Mode Pill */}
            <div className="hidden lg:flex items-center gap-1 text-[11px] font-medium text-closr-amber bg-closr-amber-bg px-2.5 py-1 rounded-full border border-closr-amber/20">
              <span className="w-1.5 h-1.5 rounded-full bg-closr-amber animate-pulse" />
              Demo Mode
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl text-closr-text-muted hover:text-closr-text hover:bg-closr-sage/30 border border-transparent hover:border-closr-border transition-all"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-closr-danger ring-2 ring-white" />
                )}
              </button>

              {/* Notification Popover */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-closr-card rounded-2xl border border-closr-border shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-closr-border">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-closr-text">Your Notifications</h4>
                      {unreadNotifsCount > 0 && (
                        <Badge variant="amber" size="sm">
                          {unreadNotifsCount} new
                        </Badge>
                      )}
                    </div>
                    {unreadNotifsCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-xs text-closr-forest hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-closr-border/50 my-2">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-closr-text-muted">
                        No notifications for your profile yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleMarkNotifRead(notif.id)}
                          className={cn(
                            'py-2.5 px-1 flex items-start gap-2.5 text-left cursor-pointer transition-colors',
                            !notif.isRead ? 'bg-closr-sage/20 rounded-lg px-2' : 'hover:bg-closr-bg/50'
                          )}
                        >
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full mt-1.5 shrink-0',
                              !notif.isRead ? 'bg-closr-forest' : 'bg-transparent'
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-closr-text truncate">
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-closr-text-muted line-clamp-2 mt-0.5">
                              {notif.description}
                            </p>
                            <span className="text-[10px] text-closr-text-muted mt-1 block">
                              {notif.timestamp}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t border-closr-border text-center">
                    <button
                      type="button"
                      onClick={() => setIsNotifOpen(false)}
                      className="text-xs text-closr-text-muted hover:text-closr-text font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-closr-sage/30 border border-transparent hover:border-closr-border transition-all"
              >
                <Avatar
                  name={activePatient?.name || 'Patient'}
                  size="sm"
                  className="bg-closr-sage text-closr-forest ring-1 ring-closr-border"
                />
                <span className="text-xs font-semibold text-closr-text hidden sm:inline max-w-[120px] truncate">
                  {activePatient?.name || 'Patient'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-closr-text-muted" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-closr-card rounded-2xl border border-closr-border shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-closr-border mb-1">
                    <p className="text-xs font-bold text-closr-text truncate">
                      {activePatient?.name || 'Patient'}
                    </p>
                    <p className="text-[11px] text-closr-text-muted truncate">
                      {activePatient?.phone || activePatient?.email || 'Patient Account'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate('/patient/profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-closr-text hover:bg-closr-sage/30 rounded-xl text-left"
                  >
                    <User className="w-3.5 h-3.5 text-closr-text-muted" />
                    My Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate('/receptionist');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-closr-forest hover:bg-closr-sage/30 rounded-xl text-left"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    AI Receptionist View
                  </button>

                  <div className="my-1 border-t border-closr-border" />

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-closr-danger hover:bg-closr-danger-bg rounded-xl text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* 3. Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-closr-card/95 backdrop-blur-md border-t border-closr-border z-30 px-2 py-1.5 shadow-lg">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-semibold transition-all',
                  isActive
                    ? 'text-closr-forest bg-closr-sage/40'
                    : 'text-closr-text-muted hover:text-closr-text'
                )}
              >
                <Icon className={cn('w-4 h-4 mb-1', isActive ? 'text-closr-forest' : 'text-closr-text-muted')} />
                <span>{item.name.replace('My ', '')}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
