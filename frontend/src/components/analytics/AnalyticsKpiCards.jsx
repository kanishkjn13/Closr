import React from 'react';
import { Calendar, CheckCircle2, Ban, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../lib/utils';
export const AnalyticsKpiCards = ({ kpi, className }) => {
    const cards = [
        {
            id: 'total',
            title: 'Total Appointments',
            value: kpi.totalAppointments,
            unit: 'bookings',
            icon: <Calendar className="w-4 h-4 text-closr-forest"/>,
            subtext: kpi.appointmentsDiffPercent !== undefined ? (<span className={cn('inline-flex items-center gap-0.5 text-xs font-semibold', kpi.appointmentsDiffPercent >= 0 ? 'text-closr-success' : 'text-closr-danger')}>
            {kpi.appointmentsDiffPercent >= 0 ? (<ArrowUpRight className="w-3.5 h-3.5"/>) : (<ArrowDownRight className="w-3.5 h-3.5"/>)}
            {Math.abs(kpi.appointmentsDiffPercent)}% vs prev period
          </span>) : (<span className="text-xs text-closr-text-muted">Calculated from mock appointments</span>),
        },
        {
            id: 'confirmed',
            title: 'Confirmed Appointments',
            value: kpi.confirmedAppointments,
            unit: 'confirmed',
            icon: <CheckCircle2 className="w-4 h-4 text-closr-forest"/>,
            subtext: (<span className="text-xs text-closr-text-muted">
          <strong className="text-closr-forest font-semibold">{kpi.confirmationRate}%</strong> confirmation rate
        </span>),
        },
        {
            id: 'cancellation',
            title: 'Cancellation Rate',
            value: `${kpi.cancellationRate}%`,
            unit: `${kpi.cancelledAppointments} cancelled`,
            icon: <Ban className="w-4 h-4 text-closr-amber"/>,
            subtext: (<span className="text-xs text-closr-text-muted">
          {kpi.cancelledAppointments > 0 ? (<span>{kpi.cancelledAppointments} total cancellations</span>) : (<span className="text-closr-success font-medium">Zero cancellations</span>)}
        </span>),
        },
        {
            id: 'patients',
            title: 'Patients Assisted',
            value: kpi.uniquePatientsAssisted,
            unit: 'unique patients',
            icon: <Users className="w-4 h-4 text-closr-forest"/>,
            subtext: (<span className="text-xs text-closr-text-muted">
          Appointments & active conversations
        </span>),
        },
    ];
    return (<div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {cards.map((card) => (<div key={card.id} className="p-4 rounded-2xl bg-closr-card border border-closr-border shadow-soft flex flex-col justify-between space-y-3 text-left transition-all hover:border-closr-forest/30">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-closr-text-muted uppercase tracking-wider">
              {card.title}
            </span>
            <div className="w-8 h-8 rounded-xl bg-closr-sage/40 flex items-center justify-center text-closr-forest shadow-2xs">
              {card.icon}
            </div>
          </div>

          {/* Metric Value */}
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl lg:text-3xl font-serif font-bold text-closr-text">
                {card.value}
              </span>
              <span className="text-xs text-closr-text-muted font-medium">{card.unit}</span>
            </div>
          </div>

          {/* Subtext Footer */}
          <div className="pt-2 border-t border-closr-border/60">{card.subtext}</div>
        </div>))}
    </div>);
};
