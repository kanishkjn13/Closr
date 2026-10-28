import React from 'react';
import { Stethoscope, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';
export const PopularServicesCard = ({ categories, className, }) => {
    const hasData = categories.length > 0;
    return (<div className={cn('p-5 rounded-2xl bg-closr-card border border-closr-border shadow-soft flex flex-col justify-between text-left space-y-4', className)}>
      {/* Header */}
      <div>
        <h3 className="font-serif font-bold text-base text-closr-text flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-closr-forest"/>
          Popular Appointment Types
        </h3>
        <p className="text-xs text-closr-text-muted mt-0.5">
          Distribution across clinic consultation services
        </p>
      </div>

      {/* Content */}
      {!hasData ? (<div className="h-44 flex flex-col items-center justify-center text-center p-6 text-closr-text-muted">
          <Activity className="w-6 h-6 text-closr-forest mb-2"/>
          <p className="text-xs font-semibold text-closr-text">No Service Records Found</p>
          <p className="text-[11px] mt-0.5">No appointment service data in this selected range.</p>
        </div>) : (<div className="space-y-3">
          {categories.map((cat, index) => (<div key={cat.service} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-closr-text text-[11px] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-md bg-closr-sage/50 text-closr-forest font-bold text-[10px] flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  {cat.service}
                </span>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-closr-text text-[11px]">
                    {cat.count} booking{cat.count !== 1 ? 's' : ''}
                  </span>
                  <span className="text-[10px] text-closr-text-muted w-10 text-right">
                    {cat.percentage}%
                  </span>
                </div>
              </div>

              {/* Horizontal Progress Bar */}
              <div className="w-full bg-[#E2E9DF] h-2 rounded-full overflow-hidden">
                <div className="bg-closr-forest h-full rounded-full transition-all duration-500" style={{ width: `${cat.percentage}%` }}/>
              </div>
            </div>))}
        </div>)}
    </div>);
};
