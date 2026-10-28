import React from 'react';
import { Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
export const AppointmentSummaryCards = ({ total, confirmed, pending, cancelled, activeStatusFilter, onSelectStatusFilter, className, }) => {
    const cards = [
        {
            id: 'all',
            label: 'Total appointments',
            value: total,
            subtext: 'Scheduled for date',
            icon: <Calendar className="w-4 h-4 text-closr-forest stroke-[2]"/>,
            iconBg: 'bg-closr-pale',
            activeBorder: 'border-closr-forest ring-1 ring-closr-forest/20',
        },
        {
            id: 'confirmed',
            label: 'Confirmed',
            value: confirmed,
            subtext: 'Confirmed appointments',
            icon: <CheckCircle2 className="w-4 h-4 text-closr-success stroke-[2]"/>,
            iconBg: 'bg-closr-success-badge',
            activeBorder: 'border-closr-success ring-1 ring-closr-success/30',
        },
        {
            id: 'pending',
            label: 'Pending',
            value: pending,
            subtext: 'Awaiting confirmation',
            icon: <Clock className="w-4 h-4 text-closr-amber stroke-[2]"/>,
            iconBg: 'bg-closr-amber-badge',
            activeBorder: 'border-closr-amber ring-1 ring-closr-amber/30',
        },
        {
            id: 'cancelled',
            label: 'Cancelled',
            value: cancelled,
            subtext: 'Freed / cancelled',
            icon: <XCircle className="w-4 h-4 text-closr-danger stroke-[2]"/>,
            iconBg: 'bg-closr-danger-bg',
            activeBorder: 'border-closr-danger ring-1 ring-closr-danger/30',
        },
    ];
    return (<div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4', className)}>
      {cards.map((card) => {
            const isActive = activeStatusFilter === card.id;
            return (<div key={card.id} role="button" tabIndex={0} onClick={() => onSelectStatusFilter(isActive && card.id !== 'all' ? 'all' : card.id)} onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectStatusFilter(isActive && card.id !== 'all' ? 'all' : card.id);
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
