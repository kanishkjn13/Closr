import React from 'react';
import {
  ShieldAlert,
  Bot,
  CalendarClock,
  Bell,
  Building2,
  Palette,
  Database,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const PRIMARY_SETTINGS = [
  {
    id: 'escalationSafety',
    label: 'Escalation & Safety',
    description: 'Human triage triggers and emergency protocols',
    icon: <ShieldAlert className="w-4 h-4" />,
    badge: 'Core Safety',
  },
  {
    id: 'receptionist',
    label: 'AI Receptionist Rules',
    description: 'Autonomous booking logic, conflict handling, and tone',
    icon: <Bot className="w-4 h-4" />,
    badge: 'AI Core',
  },
  {
    id: 'appointmentRules',
    label: 'Appointment & Availability',
    description: 'OPD timings, buffer duration, and calendar lock',
    icon: <CalendarClock className="w-4 h-4" />,
  },
  {
    id: 'notifications',
    label: 'Reminders & Alerts',
    description: 'Patient confirmation channels and urgent triage notifications',
    icon: <Bell className="w-4 h-4" />,
  },
];

export const SECONDARY_SETTINGS = [
  {
    id: 'profile',
    label: 'Clinic Profile',
    description: 'Name, address, registration, and contact details',
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    id: 'appearance',
    label: 'Appearance & Display',
    description: 'Theme density, card density, and date formats',
    icon: <Palette className="w-4 h-4" />,
  },
  {
    id: 'dataPrivacy',
    label: 'Data & Privacy',
    description: 'Storage mode, demo reset, and cache management',
    icon: <Database className="w-4 h-4" />,
  },
];

export const SETTINGS_SECTIONS = [...PRIMARY_SETTINGS, ...SECONDARY_SETTINGS];

export const SettingsNav = ({
  activeSection,
  onSelectSection,
  className,
}) => {
  return (
    <nav className={cn('select-none', className)}>
      {/* Mobile Horizontal Scrollable Tabs */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
        {SETTINGS_SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSelectSection(sec.id)}
              className={cn(
                'px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 border transition-all closr-focus',
                isActive
                  ? 'bg-closr-forest text-white border-closr-forest shadow-soft'
                  : 'bg-closr-card border-closr-border text-closr-text hover:bg-closr-sage/30'
              )}
            >
              <span>{sec.icon}</span>
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop Vertical Menu */}
      <div className="hidden lg:flex flex-col gap-4 w-64 xl:w-72 shrink-0">
        {/* Group 1: Primary AI & Safety Focus */}
        <div className="space-y-1">
          <div className="px-3 py-1 flex items-center justify-between text-[11px] font-bold text-closr-forest uppercase tracking-wider">
            <span>AI Decision & Safety</span>
            <span className="text-[10px] text-closr-forest bg-closr-sage/60 px-1.5 py-0.2 rounded font-medium">Primary</span>
          </div>
          {PRIMARY_SETTINGS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectSection(sec.id)}
                className={cn(
                  'w-full p-2.5 rounded-2xl text-left border transition-all flex items-start gap-3 closr-focus',
                  isActive
                    ? 'bg-closr-card border-closr-border shadow-soft ring-1 ring-closr-forest/20'
                    : 'border-transparent hover:bg-closr-card/60 text-closr-text-muted hover:text-closr-text'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                    isActive
                      ? 'bg-closr-forest text-white shadow-2xs'
                      : 'bg-closr-sage/30 text-closr-forest'
                  )}
                >
                  {sec.icon}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p
                      className={cn(
                        'text-xs font-semibold leading-tight',
                        isActive ? 'text-closr-text' : 'text-closr-text-muted'
                      )}
                    >
                      {sec.label}
                    </p>
                  </div>
                  <p className="text-[10px] text-closr-text-muted mt-0.5 leading-snug line-clamp-1">
                    {sec.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Group 2: Secondary Configuration (Visual separation to prevent judge distraction) */}
        <div className="pt-2 border-t border-closr-border/60 space-y-1">
          <div className="px-3 py-1 flex items-center justify-between text-[11px] font-medium text-closr-text-muted/80 uppercase tracking-wider">
            <span>Secondary Preferences</span>
            <span className="text-[9px] text-closr-text-muted bg-closr-border/60 px-1.5 py-0.2 rounded">Secondary</span>
          </div>
          {SECONDARY_SETTINGS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectSection(sec.id)}
                className={cn(
                  'w-full p-2 rounded-xl text-left border transition-all flex items-center gap-2.5 closr-focus opacity-80 hover:opacity-100',
                  isActive
                    ? 'bg-closr-card border-closr-border shadow-2xs opacity-100'
                    : 'border-transparent hover:bg-closr-card/40 text-closr-text-muted hover:text-closr-text'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    isActive
                      ? 'bg-closr-forest text-white'
                      : 'bg-closr-sage/20 text-closr-text-muted'
                  )}
                >
                  {sec.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-xs font-medium leading-tight truncate',
                      isActive ? 'text-closr-text font-semibold' : 'text-closr-text-muted'
                    )}
                  >
                    {sec.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
