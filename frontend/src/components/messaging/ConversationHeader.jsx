import React from 'react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Dropdown } from '../ui/Dropdown';
import { ChevronLeft, MoreVertical, User, Calendar, CheckCircle, AlertTriangle, Sidebar as SidebarIcon, } from 'lucide-react';
import { cn } from '../../lib/utils';
export const ConversationHeader = ({ conversation, onBackToInbox, onViewPatient, onViewAppointment, onToggleResolved, onOpenEscalation, onToggleContextPanel, isContextOpen = true, className, }) => {
    const actions = [
        {
            id: 'patient',
            label: 'View patient profile',
            icon: <User className="w-3.5 h-3.5 text-closr-forest"/>,
            onClick: onViewPatient,
        },
        ...(conversation.bookingId
            ? [
                {
                    id: 'appointment',
                    label: `View appointment (${conversation.bookingId})`,
                    icon: <Calendar className="w-3.5 h-3.5 text-closr-forest"/>,
                    onClick: onViewAppointment,
                },
            ]
            : []),
        {
            id: 'resolved',
            label: conversation.isResolved ? 'Mark as active' : 'Mark as resolved',
            icon: <CheckCircle className="w-3.5 h-3.5 text-closr-success"/>,
            onClick: onToggleResolved,
        },
        {
            id: 'escalate',
            label: 'Escalate to human triage',
            icon: <AlertTriangle className="w-3.5 h-3.5 text-closr-amber"/>,
            onClick: onOpenEscalation,
        },
    ];
    return (<div className={cn('px-4 py-3 bg-closr-card border-b border-closr-border flex items-center justify-between select-none shrink-0', className)}>
      {/* Left: Mobile back button & Patient info */}
      <div className="flex items-center gap-2.5 min-w-0">
        {onBackToInbox && (<button type="button" onClick={onBackToInbox} aria-label="Back to inbox" className="lg:hidden p-1.5 -ml-1 text-closr-forest hover:bg-closr-sage/40 rounded-xl transition-colors closr-focus">
            <ChevronLeft className="w-5 h-5 stroke-[2.2]"/>
          </button>)}

        <Avatar name={conversation.patientName} size="sm" className="bg-closr-sage text-closr-forest font-semibold shrink-0 ring-1 ring-closr-border/60"/>

        <div className="text-left min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-closr-text truncate">
              {conversation.patientName}
            </span>
            <span className="font-mono text-[10px] text-closr-forest font-bold bg-closr-sage/50 px-1.5 py-0.5 rounded border border-closr-border">
              {conversation.patientId}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-closr-text-muted mt-0.5">
            {conversation.bookingId && (<span className="font-mono text-closr-forest font-medium">
                {conversation.bookingId}
              </span>)}
            <Badge variant={conversation.status === 'escalated'
            ? 'danger'
            : conversation.isResolved
                ? 'completed'
                : 'confirmed'} size="sm">
              {conversation.status === 'escalated'
            ? 'Escalated'
            : conversation.isResolved
                ? 'Resolved'
                : 'Saathi Active'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Right: Actions menu & Context toggle */}
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={onToggleContextPanel} aria-label={isContextOpen ? 'Hide patient details' : 'Show patient details'} className={cn('p-1.5 rounded-lg border text-closr-text-muted transition-colors closr-focus', isContextOpen
            ? 'bg-closr-sage/50 border-closr-border text-closr-forest'
            : 'border-transparent hover:bg-closr-sage/30 hover:text-closr-text')}>
          <SidebarIcon className="w-4 h-4"/>
        </button>

        <Dropdown align="right" trigger={<button type="button" aria-label="Conversation actions" className="p-1.5 rounded-lg hover:bg-closr-sage/40 text-closr-text-muted hover:text-closr-text transition-colors closr-focus">
              <MoreVertical className="w-4 h-4"/>
            </button>} items={actions}/>
      </div>
    </div>);
};
