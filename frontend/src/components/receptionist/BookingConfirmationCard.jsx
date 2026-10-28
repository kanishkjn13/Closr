import React from 'react';
import { Check, Calendar, BookmarkCheck } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { ReminderPreview } from './ReminderPreview';
import { cn } from '../../lib/utils';
export const BookingConfirmationCard = ({ doctorName = 'Dr. Sharma', dateTime = 'Thu, Oct 29, 5:30 PM', bookingId = 'SAT-2041', status = 'confirmed', onCancel, onReschedule, className, }) => {
    const isCancelled = status === 'cancelled';
    return (<div className={cn('w-full max-w-[360px] sm:max-w-[390px] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-soft border text-left transition-all duration-200 select-none my-3', isCancelled
            ? 'bg-closr-danger-bg/80 border-closr-danger/30'
            : 'bg-[#E2E9DF] border-[#D0DEC9]', className)}>
      {/* 1. Header with Check Icon */}
      <div className="flex items-center gap-2.5">
        <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs', isCancelled ? 'bg-closr-danger' : 'bg-closr-forest')}>
          <Check className="w-4 h-4 stroke-[2.6]"/>
        </div>
        <h3 className="font-semibold text-sm sm:text-base text-closr-text tracking-tight">
          {isCancelled ? 'Booking Cancelled (Demo)' : 'Your appointment has been confirmed.'}
        </h3>
      </div>

      {/* 2. Inner White Card with Appointment Details */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-closr-border/80 shadow-xs space-y-3">
        {/* Doctor Row */}
        <div className="flex items-center gap-2.5 pb-2.5 border-b border-closr-border/60">
          <Avatar name={doctorName} size="sm" className="ring-1 ring-closr-border bg-closr-sage text-closr-forest shrink-0"/>
          <div className="text-left">
            <span className="text-[10px] text-closr-text-muted uppercase tracking-wider block">
              Doctor
            </span>
            <span className="text-xs sm:text-[13px] font-semibold text-closr-text">
              {doctorName}
            </span>
          </div>
        </div>

        {/* Schedule & ID Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Date & Time */}
          <div className="space-y-0.5">
            <span className="text-[10px] text-closr-text-muted flex items-center gap-1">
              <Calendar className="w-3 h-3 text-closr-forest shrink-0"/>
              <span>Date & Time</span>
            </span>
            <span className="font-semibold text-closr-text text-[11px] sm:text-xs block">
              {dateTime}
            </span>
          </div>

          {/* Booking ID */}
          <div className="space-y-0.5">
            <span className="text-[10px] text-closr-text-muted flex items-center gap-1">
              <BookmarkCheck className="w-3 h-3 text-closr-forest shrink-0"/>
              <span>Booking ID</span>
            </span>
            <span className="font-mono font-bold text-closr-forest text-[11px] sm:text-xs block">
              {bookingId}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-closr-border/60 text-[10px] text-closr-text-muted flex items-center justify-between">
          <span>Demo record · saved 5:13 PM</span>
          {status === 'rescheduled' && (<span className="text-closr-amber font-semibold">Rescheduled</span>)}
        </div>
      </div>

      {/* 3. Reminder Preview Section */}
      {!isCancelled && (<ReminderPreview mainText="We'll remind you tomorrow at 3:30 PM." subText="For medical advice or diagnosis, please consult a qualified healthcare professional."/>)}

      {/* 4. Action Buttons (Cancel / Reschedule) */}
      {!isCancelled ? (<div className="grid grid-cols-2 gap-2.5 pt-1">
          <button type="button" onClick={onCancel} className="w-full py-2.5 px-3 rounded-xl bg-white/90 border border-closr-border text-xs font-semibold text-closr-text hover:bg-white active:scale-[0.98] transition-all closr-focus shadow-xs text-center">
            Cancel
          </button>
          <button type="button" onClick={onReschedule} className="w-full py-2.5 px-3 rounded-xl bg-closr-forest text-white text-xs font-semibold hover:bg-closr-forest-hover active:scale-[0.98] transition-all closr-focus shadow-soft text-center">
            Reschedule
          </button>
        </div>) : (<div className="pt-1">
          <button type="button" onClick={onReschedule} className="w-full py-2.5 px-3 rounded-xl bg-closr-forest text-white text-xs font-semibold hover:bg-closr-forest-hover transition-all closr-focus text-center shadow-soft">
            Rebook Appointment
          </button>
        </div>)}
    </div>);
};
