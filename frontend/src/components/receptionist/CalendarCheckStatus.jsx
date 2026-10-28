import React from 'react';
import { CalendarCheck2 } from 'lucide-react';
import { cn } from '../../lib/utils';
export const CalendarCheckStatus = ({ text = "I've checked the clinic calendar", className, }) => {
    return (<div className={cn('flex items-center gap-1.5 py-1 px-1 text-[11px] text-closr-text-muted select-none text-left', className)}>
      <CalendarCheck2 className="w-3.5 h-3.5 text-closr-forest shrink-0" aria-hidden="true"/>
      <span>{text}</span>
    </div>);
};
