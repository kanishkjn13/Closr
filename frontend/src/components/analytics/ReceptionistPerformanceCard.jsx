import React from 'react';
import { MessageSquare, CalendarCheck, ShieldAlert, Zap, Clock, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
export const ReceptionistPerformanceCard = ({ metrics, className, }) => {
    return (<div className={cn('p-5 rounded-2xl bg-closr-card border border-closr-border shadow-soft flex flex-col justify-between text-left space-y-4', className)}>
      {/* Header */}
      <div>
        <h3 className="font-serif font-bold text-base text-closr-text flex items-center gap-2">
          <Zap className="w-4 h-4 text-closr-forest"/>
          Receptionist Performance
        </h3>
        <p className="text-xs text-closr-text-muted mt-0.5">
          How Closr supports daily clinic operations
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-3">
        {/* Conversations & Bookings */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white border border-closr-border/80 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-semibold text-closr-text-muted flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-closr-forest"/> Conversations
            </span>
            <span className="font-serif font-bold text-xl text-closr-text block">
              {metrics.conversationsHandled}
            </span>
            <span className="text-[10px] text-closr-text-muted">Multi-channel triage</span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-closr-border/80 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-semibold text-closr-text-muted flex items-center gap-1">
              <CalendarCheck className="w-3 h-3 text-closr-forest"/> Bookings Made
            </span>
            <span className="font-serif font-bold text-xl text-closr-text block">
              {metrics.appointmentsBooked}
            </span>
            <span className="text-[10px] text-closr-forest font-medium">Saathi AI scheduled</span>
          </div>
        </div>

        {/* Booking Conversion Rate Progress */}
        <div className="p-3 rounded-xl bg-white border border-closr-border/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-closr-text">Booking Conversion Rate</span>
            <span className="font-mono font-bold text-closr-forest">
              {metrics.bookingConversionRate !== null ? `${metrics.bookingConversionRate}%` : 'N/A'}
            </span>
          </div>

          <div className="w-full bg-[#E2E9DF] h-2 rounded-full overflow-hidden">
            <div className="bg-closr-forest h-full rounded-full transition-all duration-500" style={{ width: `${metrics.bookingConversionRate || 0}%` }}/>
          </div>

          <p className="text-[10px] text-closr-text-muted">
            Conversion of patient booking inquiries into confirmed calendar slots.
          </p>
        </div>

        {/* Escalations & Response Time */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white border border-closr-border/80 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-semibold text-closr-text-muted flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-closr-amber"/> Escalations
            </span>
            <span className="font-serif font-bold text-xl text-closr-text block">
              {metrics.escalationsCount}
            </span>
            <span className="text-[10px] text-closr-text-muted">Human handoffs</span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-closr-border/80 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-semibold text-closr-text-muted flex items-center gap-1">
              <Clock className="w-3 h-3 text-closr-forest"/> Avg Response
            </span>
            <span className="font-serif font-bold text-xl text-closr-text block">
              {metrics.avgResponseTimeSeconds !== null ? `${metrics.avgResponseTimeSeconds}s` : 'N/A'}
            </span>
            <span className="text-[10px] text-closr-text-muted">Measured baseline</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-start gap-1.5 p-2 rounded-xl bg-closr-sage/30 text-[10px] text-closr-text-muted border border-closr-border/60">
        <Info className="w-3.5 h-3.5 text-closr-forest shrink-0 mt-0.5"/>
        <span>
          Derived directly from local message histories, appointments, and escalation records.
        </span>
      </div>
    </div>);
};
