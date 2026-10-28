import React from 'react';
import { cn } from '../../lib/utils';
export const Input = React.forwardRef(({ className, label, error, hint, id, disabled, leftIcon, rightIcon, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;
    return (<div className="w-full space-y-1.5 text-left">
        {label && (<label htmlFor={inputId} className="block text-xs font-semibold text-closr-text uppercase tracking-wider">
            {label}
          </label>)}
        <div className="relative flex items-center">
          {leftIcon && (<div className="absolute left-3.5 flex items-center pointer-events-none text-closr-text-muted">
              {leftIcon}
            </div>)}
          <input ref={ref} id={inputId} disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={errorId || hintId} className={cn('w-full bg-closr-card text-closr-text placeholder:text-closr-text-subtle text-sm rounded-xl border border-closr-border py-2.5 px-3.5 transition-all duration-200 outline-none', 'focus:border-closr-forest focus:ring-2 focus:ring-closr-forest/15', 'disabled:opacity-50 disabled:bg-closr-bg disabled:cursor-not-allowed', leftIcon ? 'pl-10' : '', rightIcon ? 'pr-10' : '', error && 'border-closr-danger focus:border-closr-danger focus:ring-closr-danger/15', className)} {...props}/>
          {rightIcon && (<div className="absolute right-3.5 flex items-center text-closr-text-muted">
              {rightIcon}
            </div>)}
        </div>
        {error && (<p id={errorId} className="text-xs text-closr-danger font-medium mt-1">
            {error}
          </p>)}
        {!error && hint && (<p id={hintId} className="text-xs text-closr-text-muted mt-1">
            {hint}
          </p>)}
      </div>);
});
Input.displayName = 'Input';
