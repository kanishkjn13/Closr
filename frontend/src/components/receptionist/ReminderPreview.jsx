import React from 'react';
import { Bell } from 'lucide-react';
import { cn } from '../../lib/utils';
export const ReminderPreview = ({ mainText = "We'll remind you tomorrow at 3:30 PM.", subText = 'For medical advice or diagnosis, please consult a qualified healthcare professional.', className, }) => {
    return (<div className={cn('flex items-start gap-2.5 p-3 rounded-xl bg-white/70 border border-closr-border/60 text-left select-none', className)}>
      <Bell className="w-4 h-4 text-closr-forest shrink-0 mt-0.5" aria-hidden="true"/>
      <div className="space-y-0.5 text-left min-w-0">
        <p className="text-xs font-semibold text-closr-text leading-tight">
          {mainText}
        </p>
        <p className="text-[11px] text-closr-text-muted leading-tight">
          {subText}
        </p>
      </div>
    </div>);
};
