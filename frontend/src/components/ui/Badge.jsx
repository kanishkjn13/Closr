import React from 'react';
import { cn } from '../../lib/utils';
export const Badge = ({ className, variant = 'neutral', size = 'md', dot = false, children, ...props }) => {
    const variantStyles = {
        confirmed: {
            bg: 'bg-closr-sage/60 border-closr-sage-dark/40',
            text: 'text-closr-forest font-semibold',
            dot: 'bg-closr-forest',
        },
        'waitlist-offer': {
            bg: 'bg-closr-amber-badge border-closr-amber/30',
            text: 'text-closr-amber font-semibold',
            dot: 'bg-closr-amber',
        },
        pending: {
            bg: 'bg-closr-bg border-closr-border',
            text: 'text-closr-text-muted',
            dot: 'bg-closr-text-muted',
        },
        cancelled: {
            bg: 'bg-closr-danger-bg border-closr-danger-border',
            text: 'text-closr-danger',
            dot: 'bg-closr-danger',
        },
        completed: {
            bg: 'bg-closr-success-badge border-closr-success/30',
            text: 'text-closr-success font-medium',
            dot: 'bg-closr-success',
        },
        escalated: {
            bg: 'bg-closr-amber-badge border-closr-amber/40',
            text: 'text-closr-amber font-semibold',
            dot: 'bg-closr-amber',
        },
        active: {
            bg: 'bg-closr-sage/60 border-closr-sage-dark/30',
            text: 'text-closr-forest',
            dot: 'bg-closr-forest',
        },
        inactive: {
            bg: 'bg-closr-bg border-closr-border',
            text: 'text-closr-text-muted',
            dot: 'bg-closr-text-subtle',
        },
        new: {
            bg: 'bg-closr-pale border-closr-sage',
            text: 'text-closr-forest font-medium',
            dot: 'bg-closr-forest',
        },
        'follow-up': {
            bg: 'bg-closr-sage/50 border-closr-border',
            text: 'text-closr-text font-medium',
            dot: 'bg-closr-text',
        },
        neutral: {
            bg: 'bg-closr-bg border-closr-border',
            text: 'text-closr-text-muted',
            dot: 'bg-closr-text-muted',
        },
        success: {
            bg: 'bg-closr-success-badge border-closr-success/30',
            text: 'text-closr-success',
            dot: 'bg-closr-success',
        },
        warning: {
            bg: 'bg-closr-amber-badge border-closr-amber/30',
            text: 'text-closr-amber',
            dot: 'bg-closr-amber',
        },
        danger: {
            bg: 'bg-closr-danger-bg border-closr-danger-border',
            text: 'text-closr-danger',
            dot: 'bg-closr-danger',
        },
    };
    const style = variantStyles[variant] || variantStyles.neutral;
    const sizeStyles = {
        sm: 'text-[11px] px-2 py-0.5 gap-1 rounded-md border',
        md: 'text-xs px-2.5 py-1 gap-1.5 rounded-full border',
    };
    return (<span className={cn('inline-flex items-center font-medium tracking-tight whitespace-nowrap select-none transition-colors', style.bg, style.text, sizeStyles[size], className)} {...props}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', style.dot)}/>}
      <span>{children}</span>
    </span>);
};
