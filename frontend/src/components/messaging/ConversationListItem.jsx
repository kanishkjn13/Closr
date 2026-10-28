import React from 'react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { AlertCircle, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
export const ConversationListItem = ({ conversation, isSelected, onSelect, }) => {
    const isEscalated = conversation.status === 'escalated';
    return (<div role="button" tabIndex={0} onClick={onSelect} onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect();
            }
        }} className={cn('p-3.5 rounded-2xl transition-all duration-150 cursor-pointer text-left select-none border border-transparent closr-focus relative', isSelected
            ? 'bg-closr-sage/65 border-closr-border text-closr-text shadow-xs'
            : 'hover:bg-closr-sage/25 text-closr-text')}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <Avatar name={conversation.patientName} size="sm" className="bg-closr-sage text-closr-forest font-semibold ring-1 ring-closr-border/60"/>
          {conversation.unreadCount > 0 && (<span className="absolute -top-1 -right-1 w-4 h-4 bg-closr-forest text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-closr-card shadow-xs">
              {conversation.unreadCount}
            </span>)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-xs sm:text-[13px] font-semibold text-closr-text truncate">
              {conversation.patientName}
            </span>
            <span className="text-[10px] text-closr-text-muted shrink-0 font-medium">
              {conversation.lastMessageTimestamp}
            </span>
          </div>

          <p className="text-xs text-closr-text-muted truncate leading-relaxed">
            {conversation.lastMessage}
          </p>

          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {isEscalated && (<span className="inline-flex items-center gap-1 text-[10px] font-bold text-closr-danger bg-closr-danger-bg px-2 py-0.5 rounded-md border border-closr-danger/30">
                <AlertCircle className="w-3 h-3"/>
                <span>Urgent</span>
              </span>)}
            {conversation.bookingId && (<span className="inline-flex items-center gap-1 text-[10px] font-mono text-closr-forest bg-closr-pale px-2 py-0.5 rounded-md border border-closr-border/60">
                <Calendar className="w-2.5 h-2.5"/>
                <span>{conversation.bookingId}</span>
              </span>)}
            {conversation.isResolved && (<Badge variant="completed" size="sm">
                Resolved
              </Badge>)}
          </div>
        </div>
      </div>
    </div>);
};
