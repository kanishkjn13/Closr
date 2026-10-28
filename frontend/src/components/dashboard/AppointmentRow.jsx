import React from 'react';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
export const AppointmentRow = ({ appointment, onSelect, isLast = false, }) => {
    // Render status badge label according to reference screenshot
    const renderBadge = () => {
        switch (appointment.status) {
            case 'confirmed':
                return <Badge variant="confirmed">Confirmed</Badge>;
            case 'waitlist-offer':
                return <Badge variant="waitlist-offer">Offer Sent</Badge>;
            case 'pending':
                return <Badge variant="pending">Reminder Pending</Badge>;
            case 'cancelled':
                return <Badge variant="cancelled">Cancelled</Badge>;
            case 'completed':
                return <Badge variant="completed">Completed</Badge>;
            default:
                return <Badge variant="neutral">{appointment.status}</Badge>;
        }
    };
    return (<div role="button" tabIndex={0} onClick={() => onSelect(appointment)} onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(appointment);
            }
        }} className={cn('group flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 sm:px-6 transition-colors duration-150 text-left hover:bg-closr-sage/20 cursor-pointer closr-focus rounded-xl', !isLast && 'border-b border-closr-border/60')}>
      {/* Time & Patient Details */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-6 flex-1 min-w-0 pr-2">
        {/* Time */}
        <span className="text-xs sm:text-[13px] font-semibold text-closr-text shrink-0 w-16 sm:w-20 tracking-tight">
          {appointment.time}
        </span>

        {/* Patient Name & Service Description */}
        <div className="text-xs sm:text-[13px] text-closr-text truncate font-normal">
          <span className="font-medium text-closr-text">
            {appointment.patientName}
          </span>
          {appointment.service && (<span className="text-closr-text-muted"> · {appointment.service}</span>)}
        </div>
      </div>

      {/* Status Badge & Additional Context */}
      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 mt-2 sm:mt-0 pl-16 sm:pl-0">
        {/* Status Badge */}
        <div className="shrink-0">{renderBadge()}</div>

        {/* Additional Context Note */}
        <div className="text-[11px] sm:text-xs text-closr-text-muted text-right min-w-[140px] sm:min-w-[180px] max-w-[260px] truncate">
          {appointment.contextNote || '—'}
        </div>
      </div>
    </div>);
};
