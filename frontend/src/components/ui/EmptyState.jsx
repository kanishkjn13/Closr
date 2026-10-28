import React from 'react';
import { cn } from '../../lib/utils';
import { Inbox } from 'lucide-react';
export const EmptyState = ({ icon, title, description, action, className, }) => {
    return (<div className={cn('flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-closr-border bg-closr-card/50', className)}>
      <div className="w-12 h-12 rounded-2xl bg-closr-sage/50 flex items-center justify-center text-closr-forest mb-4">
        {icon || <Inbox className="w-6 h-6"/>}
      </div>
      <h3 className="text-base font-semibold text-closr-text mb-1 tracking-tight">
        {title}
      </h3>
      {description && (<p className="text-xs sm:text-sm text-closr-text-muted max-w-sm mb-5 leading-relaxed">
          {description}
        </p>)}
      {action && <div className="mt-1">{action}</div>}
    </div>);
};
