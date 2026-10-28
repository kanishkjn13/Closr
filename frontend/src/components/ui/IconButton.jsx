import React from 'react';
import { cn } from '../../lib/utils';
export const IconButton = React.forwardRef(({ className, variant = 'ghost', size = 'md', icon, disabled, type = 'button', 'aria-label': ariaLabel, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center transition-all duration-200 rounded-xl closr-focus disabled:opacity-40 disabled:pointer-events-none active:scale-95';
    const variants = {
        primary: 'bg-closr-forest text-white hover:bg-closr-forest-hover shadow-soft',
        secondary: 'bg-closr-pale text-closr-text hover:bg-closr-sage border border-closr-border/60',
        outline: 'bg-transparent text-closr-text border border-closr-border hover:bg-closr-card',
        ghost: 'bg-transparent text-closr-text hover:bg-closr-sage/50 text-closr-muted hover:text-closr-text',
    };
    const sizes = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
    };
    return (<button ref={ref} type={type} aria-label={ariaLabel} disabled={disabled} className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
        {icon}
      </button>);
});
IconButton.displayName = 'IconButton';
