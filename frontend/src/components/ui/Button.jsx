import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, children, disabled, type = 'button', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 select-none rounded-xl closr-focus disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
    const variants = {
        primary: 'bg-closr-forest text-white hover:bg-closr-forest-hover active:bg-closr-forest-active shadow-soft border border-transparent',
        secondary: 'bg-closr-pale text-closr-text hover:bg-closr-sage active:bg-closr-sage-dark border border-closr-border/60',
        outline: 'bg-transparent text-closr-text border border-closr-border hover:bg-closr-card hover:border-closr-text/20',
        ghost: 'bg-transparent text-closr-text hover:bg-closr-sage/40 active:bg-closr-sage/70 border border-transparent',
        danger: 'bg-closr-danger text-white hover:bg-closr-danger-hover border border-transparent shadow-soft',
    };
    const sizes = {
        sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
        md: 'text-sm px-4 py-2 gap-2 h-10',
        lg: 'text-base px-6 py-2.5 gap-2.5 h-12',
    };
    return (<button ref={ref} type={type} disabled={disabled || isLoading} className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
        {isLoading ? (<Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true"/>) : (leftIcon && <span className="shrink-0">{leftIcon}</span>)}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>);
});
Button.displayName = 'Button';
