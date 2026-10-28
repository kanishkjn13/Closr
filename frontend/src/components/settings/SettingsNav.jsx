import React from 'react';
import { Building2, Bot, CalendarClock, Bell, ShieldAlert, Palette, Database, } from 'lucide-react';
import { cn } from '../../lib/utils';
export const SETTINGS_SECTIONS = [
    {
        id: 'profile',
        label: 'Clinic Profile',
        description: 'Name, address, contact, and clinic details',
        icon: <Building2 className="w-4 h-4"/>,
    },
    {
        id: 'receptionist',
        label: 'Receptionist Preferences',
        description: 'AI identity, greeting, tone, and booking rules',
        icon: <Bot className="w-4 h-4"/>,
    },
    {
        id: 'appointmentRules',
        label: 'Appointment Rules',
        description: 'OPD timings, duration, days, and breaks',
        icon: <CalendarClock className="w-4 h-4"/>,
    },
    {
        id: 'notifications',
        label: 'Notifications & Reminders',
        description: 'Confirmation, reminder channels, and alerts',
        icon: <Bell className="w-4 h-4"/>,
    },
    {
        id: 'escalationSafety',
        label: 'Escalation & Safety',
        description: 'Human triage triggers and emergency protocols',
        icon: <ShieldAlert className="w-4 h-4"/>,
    },
    {
        id: 'appearance',
        label: 'Appearance & Display',
        description: 'Theme density, date formats, and layout',
        icon: <Palette className="w-4 h-4"/>,
    },
    {
        id: 'dataPrivacy',
        label: 'Data & Privacy',
        description: 'Storage mode, demo reset, and local state',
        icon: <Database className="w-4 h-4"/>,
    },
];
export const SettingsNav = ({ activeSection, onSelectSection, className, }) => {
    return (<nav className={cn('select-none', className)}>
      {/* Mobile Horizontal Scrollable Tabs */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
        {SETTINGS_SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (<button key={sec.id} type="button" onClick={() => onSelectSection(sec.id)} className={cn('px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 border transition-all closr-focus', isActive
                    ? 'bg-closr-forest text-white border-closr-forest shadow-soft'
                    : 'bg-closr-card border-closr-border text-closr-text hover:bg-closr-sage/30')}>
              <span>{sec.icon}</span>
              <span>{sec.label}</span>
            </button>);
        })}
      </div>

      {/* Desktop Vertical Menu */}
      <div className="hidden lg:flex flex-col gap-1 w-64 xl:w-72 shrink-0">
        {SETTINGS_SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (<button key={sec.id} type="button" onClick={() => onSelectSection(sec.id)} className={cn('w-full p-3 rounded-2xl text-left border transition-all flex items-start gap-3 closr-focus', isActive
                    ? 'bg-closr-card border-closr-border shadow-soft ring-1 ring-closr-forest/20'
                    : 'border-transparent hover:bg-closr-card/60 text-closr-text-muted hover:text-closr-text')}>
              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors', isActive
                    ? 'bg-closr-forest text-white shadow-2xs'
                    : 'bg-closr-sage/30 text-closr-forest')}>
                {sec.icon}
              </div>

              <div className="min-w-0">
                <p className={cn('text-xs font-semibold leading-tight', isActive ? 'text-closr-text' : 'text-closr-text-muted')}>
                  {sec.label}
                </p>
                <p className="text-[10px] text-closr-text-muted mt-1 leading-snug line-clamp-1">
                  {sec.description}
                </p>
              </div>
            </button>);
        })}
      </div>
    </nav>);
};
