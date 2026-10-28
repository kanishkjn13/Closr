import React from 'react';
import { Badge } from '../ui/Badge';
import { History, CalendarCheck, ShieldAlert, UserCheck, MessageSquare, HelpCircle, Calendar, } from 'lucide-react';
import { cn } from '../../lib/utils';
export const RecentAnalyticsActivity = ({ events, className, }) => {
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'escalation':
                return <ShieldAlert className="w-3.5 h-3.5 text-closr-danger"/>;
            case 'booking':
                return <CalendarCheck className="w-3.5 h-3.5 text-closr-forest"/>;
            case 'waitlist':
                return <Calendar className="w-3.5 h-3.5 text-closr-amber"/>;
            case 'lead':
                return <UserCheck className="w-3.5 h-3.5 text-closr-forest"/>;
            case 'faq':
                return <HelpCircle className="w-3.5 h-3.5 text-closr-forest"/>;
            default:
                return <MessageSquare className="w-3.5 h-3.5 text-closr-forest"/>;
        }
    };
    return (<div className={cn('p-5 rounded-2xl bg-closr-card border border-closr-border shadow-soft flex flex-col justify-between text-left space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-base text-closr-text flex items-center gap-2">
            <History className="w-4 h-4 text-closr-forest"/>
            Recent Activity
          </h3>
          <p className="text-xs text-closr-text-muted mt-0.5">
            Operational activity and AI receptionist audit events
          </p>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-2.5">
        {events.slice(0, 5).map((evt) => (<div key={evt.id} className="p-3 rounded-xl bg-white border border-closr-border/80 shadow-2xs flex items-start gap-3 transition-colors hover:bg-closr-sage/20">
            {/* Event Icon Pill */}
            <div className="w-7 h-7 rounded-lg bg-closr-sage/40 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              {getCategoryIcon(evt.category)}
            </div>

            {/* Event Details */}
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-closr-text text-xs truncate">
                  {evt.title}
                </span>
                <span className="text-[10px] text-closr-text-muted whitespace-nowrap">
                  {evt.timestamp}
                </span>
              </div>

              <p className="text-[11px] text-closr-text-muted leading-relaxed line-clamp-2">
                {evt.description}
              </p>

              {evt.relatedId && (<div className="pt-1 flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-closr-forest font-bold bg-closr-sage/40 px-1.5 py-0.5 rounded border border-closr-border/60">
                    {evt.relatedId}
                  </span>
                  <Badge variant={evt.status === 'urgent'
                    ? 'danger'
                    : evt.status === 'completed'
                        ? 'completed'
                        : 'neutral'} size="sm">
                    {evt.status === 'urgent' ? 'Attention' : evt.category}
                  </Badge>
                </div>)}
            </div>
          </div>))}
      </div>
    </div>);
};
