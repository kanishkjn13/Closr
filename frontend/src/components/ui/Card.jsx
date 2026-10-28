import React from 'react';
import { cn } from '../../lib/utils';
export const Card = React.forwardRef(({ className, title, description, headerAction, padding = 'md', children, as: Component = 'div', ...props }, ref) => {
    const paddings = {
        none: '',
        sm: 'p-3 sm:p-4',
        md: 'p-5 sm:p-6',
        lg: 'p-6 sm:p-8',
    };
    const hasHeader = Boolean(title || description || headerAction);
    return (<Component ref={ref} className={cn('bg-closr-card border border-closr-border rounded-2xl shadow-card transition-all duration-200', paddings[padding], className)} {...props}>
        {hasHeader && (<div className="flex items-start justify-between gap-4 mb-4 pb-1">
            <div className="space-y-1">
              {title && (<div className="font-semibold text-closr-text text-base sm:text-lg tracking-tight">
                  {title}
                </div>)}
              {description && (<p className="text-xs sm:text-sm text-closr-text-muted">
                  {description}
                </p>)}
            </div>
            {headerAction && <div className="shrink-0">{headerAction}</div>}
          </div>)}
        {children}
      </Component>);
});
Card.displayName = 'Card';
