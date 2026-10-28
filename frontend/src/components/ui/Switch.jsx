import React from 'react';
import { cn } from '../../lib/utils';
export const Switch = ({ id, checked, onChange, disabled = false, label, description, className, }) => {
    const switchId = id || (label ? `switch-${String(label).toLowerCase().replace(/\s+/g, '-')}` : undefined);
    return (<div className={cn('flex items-start justify-between gap-3 text-left', className)}>
      {(label || description) && (<div className="space-y-0.5 select-none">
          {label && (<label htmlFor={switchId} className={cn('text-xs font-semibold text-closr-text cursor-pointer block', disabled && 'opacity-60 cursor-not-allowed')}>
              {label}
            </label>)}
          {description && (<p className="text-[11px] text-closr-text-muted leading-relaxed">{description}</p>)}
        </div>)}

      <button id={switchId} type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => !disabled && onChange(!checked)} className={cn('relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out closr-focus mt-0.5', checked ? 'bg-closr-forest' : 'bg-closr-border', disabled && 'opacity-50 cursor-not-allowed')}>
        <span className={cn('pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out', checked ? 'translate-x-5' : 'translate-x-0')}/>
      </button>
    </div>);
};
