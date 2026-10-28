import React from 'react';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Calendar, BookmarkCheck, CalendarClock, Ban, Eye } from 'lucide-react';
import { cn } from '../../lib/utils';
export const ConversationAppointmentCard = ({ appointment, onViewAppointment, onReschedule, onCancel, className, }) => {
    const isCancelled = appointment.status === 'cancelled';
    return (<div className={cn('w-full max-w-[380px] p-4 rounded-2xl border shadow-soft select-none text-left my-2 space-y-3.5', isCancelled
            ? 'bg-closr-danger-bg/70 border-closr-danger/30'
            : 'bg-[#E2E9DF] border-[#D0DEC9]', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar name={appointment.doctorName} size="xs" className="bg-closr-forest text-white ring-1 ring-closr-border"/>
          <span className="text-xs font-semibold text-closr-text">
            {appointment.doctorName} · Clinic Visit
          </span>
        </div>
        <Badge variant={appointment.status} size="sm">
          {appointment.status === 'confirmed'
            ? 'Confirmed'
            : appointment.status === 'pending'
                ? 'Reminder Pending'
                : appointment.status}
        </Badge>
      </div>

      {/* Inner Card */}
      <div className="p-3.5 rounded-xl bg-white/95 border border-closr-border/80 shadow-xs space-y-2.5">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] text-closr-text-muted flex items-center gap-1">
              <Calendar className="w-3 h-3 text-closr-forest"/> Date & Time
            </span>
            <span className="font-semibold text-closr-text block">
              {appointment.time} · {appointment.date}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-closr-text-muted flex items-center gap-1">
              <BookmarkCheck className="w-3 h-3 text-closr-forest"/> Booking ID
            </span>
            <span className="font-mono font-bold text-closr-forest block">
              {appointment.bookingCode || '—'}
            </span>
          </div>
        </div>

        {appointment.service && (<p className="text-[11px] text-closr-text-muted pt-1 border-t border-closr-border/60">
            Service: <span className="text-closr-text font-medium">{appointment.service}</span>
          </p>)}

        <div className="flex items-center justify-between pt-1 text-[10px] text-closr-text-muted">
          <span>Demo record · synchronized</span>
          <span className="text-closr-forest font-semibold">Active Booking</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-0.5">
        <button type="button" onClick={() => onViewAppointment(appointment)} className="flex-1 py-1.5 px-2.5 rounded-xl bg-white border border-closr-border text-[11px] font-semibold text-closr-text hover:bg-closr-sage/30 transition-colors flex items-center justify-center gap-1 shadow-xs">
          <Eye className="w-3 h-3 text-closr-forest"/>
          <span>Details</span>
        </button>

        {!isCancelled && (<>
            <button type="button" onClick={() => onReschedule(appointment)} className="flex-1 py-1.5 px-2.5 rounded-xl bg-closr-forest text-white text-[11px] font-semibold hover:bg-closr-forest-hover transition-colors flex items-center justify-center gap-1 shadow-soft">
              <CalendarClock className="w-3 h-3"/>
              <span>Reschedule</span>
            </button>
            <button type="button" onClick={() => onCancel(appointment)} className="py-1.5 px-2.5 rounded-xl bg-white border border-closr-danger/30 text-[11px] font-semibold text-closr-danger hover:bg-closr-danger-bg transition-colors flex items-center justify-center gap-1 shadow-xs">
              <Ban className="w-3 h-3"/>
              <span>Cancel</span>
            </button>
          </>)}
      </div>
    </div>);
};
