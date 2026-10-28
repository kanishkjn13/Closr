import React from 'react';
import { cn } from '../../lib/utils';
export const ActivityTimelineItem = ({ event, isLast = false, onClick, }) => {
    return (<div onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} className={cn('relative pl-7 pb-4 text-left group', onClick && 'cursor-pointer')}>
      {/* Vertical Connecting Line */}
      {!isLast && (<span className="absolute left-[5px] top-3 bottom-0 w-[1.5px] bg-closr-forest/25" aria-hidden="true"/>)}

      {/* Small Circular Marker */}
      <span className={cn('absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-closr-card transition-transform group-hover:scale-110', event.category === 'escalation'
            ? 'bg-closr-forest ring-2 ring-closr-forest/20'
            : 'bg-closr-forest')} aria-hidden="true"/>

      {/* Event Header: Timestamp · Title */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs sm:text-[13px] font-semibold text-closr-text tracking-tight">
          {event.timestamp}
        </span>
        <span className="text-xs text-closr-text-muted">·</span>
        <span className={cn('text-xs sm:text-[13px] font-semibold tracking-tight', event.category === 'escalation' ? 'text-closr-text' : 'text-closr-text')}>
          {event.title}
        </span>
      </div>

      {/* Description */}
      <p className="text-[11px] sm:text-xs text-closr-text-muted mt-0.5 leading-relaxed pr-2">
        {event.description}
      </p>
    </div>);
};
