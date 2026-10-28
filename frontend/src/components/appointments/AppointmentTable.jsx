import React from 'react';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { EmptyState } from '../ui/EmptyState';
import { MoreVertical, Check, CalendarClock, Ban, Eye, Inbox, Send, Clock, CheckCheck, } from 'lucide-react';
import { Dropdown } from '../ui/Dropdown';
import { cn } from '../../lib/utils';
export const AppointmentTable = ({ appointments, onViewDetails, onConfirmAppointment, onRescheduleAppointment, onCancelAppointment, onClearFilters, className, }) => {
    if (appointments.length === 0) {
        return (<EmptyState icon={<Inbox className="w-6 h-6 text-closr-forest"/>} title="No appointments found" description="There are no scheduled visits matching your selected date or search criteria." action={onClearFilters && (<button type="button" onClick={onClearFilters} className="text-xs font-semibold px-4 py-2 rounded-xl bg-closr-forest text-white hover:bg-closr-forest-hover transition-colors">
              Reset Filters
            </button>)}/>);
    }
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return <Badge variant="confirmed">Confirmed</Badge>;
            case 'pending':
                return <Badge variant="pending">Pending</Badge>;
            case 'cancelled':
                return <Badge variant="cancelled">Cancelled</Badge>;
            case 'completed':
                return <Badge variant="completed">Completed</Badge>;
            case 'waitlist-offer':
                return <Badge variant="waitlist-offer">Offer Sent</Badge>;
            default:
                return <Badge variant="neutral">{status}</Badge>;
        }
    };
    const renderReminderPill = (status) => {
        if (!status)
            return <span className="text-closr-text-muted text-xs">—</span>;
        const styles = {
            sent: {
                icon: <Send className="w-3 h-3 text-closr-success"/>,
                text: 'Sent',
                bg: 'bg-closr-success-badge/80 text-closr-success',
            },
            scheduled: {
                icon: <Clock className="w-3 h-3 text-closr-forest"/>,
                text: 'Scheduled',
                bg: 'bg-closr-pale text-closr-forest',
            },
            pending: {
                icon: <Clock className="w-3 h-3 text-closr-amber"/>,
                text: 'Pending',
                bg: 'bg-closr-amber-badge text-closr-amber',
            },
            acknowledged: {
                icon: <CheckCheck className="w-3 h-3 text-closr-forest"/>,
                text: 'Acknowledged',
                bg: 'bg-closr-sage/60 text-closr-forest',
            },
        };
        const s = styles[status] || styles.pending;
        return (<span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border border-closr-border/60', s.bg)}>
        {s.icon}
        <span>{s.text}</span>
      </span>);
    };
    return (<div className={cn('bg-closr-card border border-closr-border rounded-2xl shadow-card overflow-hidden text-left', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-closr-border/80 bg-closr-bg/40 text-[11px] font-semibold text-closr-text-muted uppercase tracking-wider select-none">
              <th className="py-3 px-4 sm:px-6">Time</th>
              <th className="py-3 px-4">Patient</th>
              <th className="py-3 px-4">Service</th>
              <th className="py-3 px-4">Doctor</th>
              <th className="py-3 px-4">Booking ID</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Reminder</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-closr-border/50 text-xs sm:text-[13px]">
            {appointments.map((appointment) => {
            const isPending = appointment.status === 'pending' || appointment.status === 'waitlist-offer';
            const isCancelled = appointment.status === 'cancelled';
            const dropdownItems = [
                {
                    id: 'details',
                    label: 'View details',
                    icon: <Eye className="w-3.5 h-3.5"/>,
                    onClick: () => onViewDetails(appointment),
                },
                ...(isPending
                    ? [
                        {
                            id: 'confirm',
                            label: 'Confirm booking',
                            icon: <Check className="w-3.5 h-3.5 text-closr-success"/>,
                            onClick: () => onConfirmAppointment(appointment),
                        },
                    ]
                    : []),
                ...(!isCancelled
                    ? [
                        {
                            id: 'reschedule',
                            label: 'Reschedule',
                            icon: <CalendarClock className="w-3.5 h-3.5 text-closr-forest"/>,
                            onClick: () => onRescheduleAppointment(appointment),
                        },
                        {
                            id: 'cancel',
                            label: 'Cancel appointment',
                            icon: <Ban className="w-3.5 h-3.5 text-closr-danger"/>,
                            danger: true,
                            onClick: () => onCancelAppointment(appointment),
                        },
                    ]
                    : []),
            ];
            return (<tr key={appointment.id} className="hover:bg-closr-sage/20 transition-colors group cursor-pointer" onClick={() => onViewDetails(appointment)}>
                  {/* 1. Time */}
                  <td className="py-3 px-4 sm:px-6 font-semibold text-closr-text whitespace-nowrap">
                    {appointment.time}
                  </td>

                  {/* 2. Patient */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={appointment.patientName} size="xs" className="bg-closr-sage text-closr-forest shrink-0 font-medium"/>
                      <span className="font-semibold text-closr-text">
                        {appointment.patientName}
                      </span>
                    </div>
                  </td>

                  {/* 3. Service */}
                  <td className="py-3 px-4 text-closr-text-muted whitespace-nowrap">
                    {appointment.service || 'Consultation'}
                  </td>

                  {/* 4. Doctor */}
                  <td className="py-3 px-4 text-closr-text whitespace-nowrap font-medium">
                    {appointment.doctorName}
                  </td>

                  {/* 5. Booking ID */}
                  <td className="py-3 px-4 font-mono font-medium text-closr-forest whitespace-nowrap">
                    {appointment.bookingCode || '—'}
                  </td>

                  {/* 6. Status Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {renderStatusBadge(appointment.status)}
                  </td>

                  {/* 7. Reminder Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {renderReminderPill(appointment.reminderStatus)}
                  </td>

                  {/* 8. Actions Menu */}
                  <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <Dropdown align="right" trigger={<button type="button" aria-label={`Actions for ${appointment.patientName}`} className="p-1 rounded-lg hover:bg-closr-sage/50 text-closr-text-muted hover:text-closr-text transition-colors closr-focus">
                          <MoreVertical className="w-4 h-4"/>
                        </button>} items={dropdownItems}/>
                  </td>
                </tr>);
        })}
          </tbody>
        </table>
      </div>

      {/* Table Footer Count */}
      <div className="px-5 py-3 border-t border-closr-border/60 bg-closr-bg/20 text-[11px] text-closr-text-muted flex items-center justify-between">
        <span>Showing {appointments.length} appointments</span>
        <span className="italic">Local demo dataset</span>
      </div>
    </div>);
};
