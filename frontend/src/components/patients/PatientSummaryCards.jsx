import React from 'react';
import { Users, CalendarCheck, UserPlus, UserCheck } from 'lucide-react';
import { cn } from '../../lib/utils';
export const PatientSummaryCards = ({ total, upcomingVisitsCount, newPatientsCount, followUpCount, activeStatusFilter, onSelectStatusFilter, className, }) => {
    const cards = [
        {
            id: 'all',
            label: 'Total patients',
            value: total,
            subtext: 'Registered clinic profiles',
            icon: <Users className="w-4 h-4 text-closr-forest stroke-[2]"/>,
            iconBg: 'bg-closr-pale',
            activeBorder: 'border-closr-forest ring-1 ring-closr-forest/20',
        },
        {
            id: 'upcoming',
            label: 'Upcoming visits',
            value: upcomingVisitsCount,
            subtext: 'Patients with booked slots',
            icon: <CalendarCheck className="w-4 h-4 text-closr-forest stroke-[2]"/>,
            iconBg: 'bg-closr-sage/60',
            activeBorder: 'border-closr-forest ring-1 ring-closr-forest/20',
        },
        {
            id: 'new',
            label: 'New patients',
            value: newPatientsCount,
            subtext: 'First-time clinic visits',
            icon: <UserPlus className="w-4 h-4 text-closr-amber stroke-[2]"/>,
            iconBg: 'bg-closr-amber-badge',
            activeBorder: 'border-closr-amber ring-1 ring-closr-amber/30',
        },
        {
            id: 'follow-up',
            label: 'Follow-ups',
            value: followUpCount,
            subtext: 'Care continuation needed',
            icon: <UserCheck className="w-4 h-4 text-closr-success stroke-[2]"/>,
            iconBg: 'bg-closr-success-badge',
            activeBorder: 'border-closr-success ring-1 ring-closr-success/30',
        },
    ];
    return (<div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4', className)}>
      {cards.map((card) => {
            const isActive = activeStatusFilter === card.id;
            return (<div key={card.id} role="button" tabIndex={0} onClick={() => {
                    if (card.id === 'upcoming') {
                        onSelectStatusFilter('all');
                    }
                    else {
                        onSelectStatusFilter(isActive && card.id !== 'all' ? 'all' : card.id);
                    }
                }} onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (card.id === 'upcoming') {
                            onSelectStatusFilter('all');
                        }
                        else {
                            onSelectStatusFilter(isActive && card.id !== 'all' ? 'all' : card.id);
                        }
                    }
                }} className={cn('p-4 rounded-2xl bg-closr-card border border-closr-border transition-all duration-150 cursor-pointer text-left select-none closr-focus shadow-xs hover:border-closr-border-dark', isActive && card.activeBorder)}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-closr-text-muted">
                {card.label}
              </span>
              <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-closr-border/40', card.iconBg)}>
                {card.icon}
              </div>
            </div>

            <div className="font-serif text-2xl sm:text-3xl text-closr-forest font-medium tracking-tight">
              {card.value}
            </div>

            <p className="text-[11px] text-closr-text-muted mt-1 truncate">
              {card.subtext}
            </p>
          </div>);
        })}
    </div>);
};
