import React from 'react';
import { cn } from '../../lib/utils';
export const MetricCard = ({ icon, iconBg = 'bg-closr-pale', iconColor = 'text-closr-forest', value, label, comparison, tone = 'neutral', onClick, className, }) => {
    const toneStyles = {
        green: 'text-closr-success font-medium',
        neutral: 'text-closr-text-muted',
        amber: 'text-closr-amber font-medium',
    };
    return (<div onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={(e) => {
            if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onClick();
            }
        }} className={cn('bg-closr-card border border-closr-border rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 text-left relative overflow-hidden', onClick && 'cursor-pointer hover:border-closr-border-dark hover:shadow-card active:scale-[0.99] closr-focus', className)}>
      {/* Top Left Icon Container */}
      <div className="mb-4">
        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0 border border-closr-border/40', iconBg, iconColor)}>
          {icon}
        </div>
      </div>

      {/* Metric Value & Label */}
      <div className="space-y-1 mb-3">
        <div className="font-serif text-3xl sm:text-4xl text-closr-forest font-normal tracking-tight">
          {value}
        </div>
        <p className="text-xs sm:text-[13px] text-closr-text font-medium tracking-tight">
          {label}
        </p>
      </div>

      {/* Comparison Text */}
      <div className={cn('text-[11px] sm:text-xs pt-1 border-t border-closr-border/50', toneStyles[tone])}>
        {comparison}
      </div>
    </div>);
};
