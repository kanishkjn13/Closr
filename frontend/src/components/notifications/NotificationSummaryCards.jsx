import React from 'react';
import { Bell, MailOpen, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
export const NotificationSummaryCards = ({ totalCount, unreadCount, needsAttentionCount, activeFilter, onSelectFilter, className, }) => {
    const cards = [
        {
            id: 'all',
            title: 'All Notifications',
            count: totalCount,
            subtext: 'Total recorded events',
            icon: <Bell className="w-4 h-4 text-closr-forest"/>,
        },
        {
            id: 'unread',
            title: 'Unread Messages',
            count: unreadCount,
            subtext: unreadCount === 0 ? 'All caught up' : `${unreadCount} awaiting review`,
            icon: <MailOpen className="w-4 h-4 text-closr-forest"/>,
        },
        {
            id: 'attention',
            title: 'Needs Attention',
            count: needsAttentionCount,
            subtext: needsAttentionCount === 0 ? 'No urgent triage cases' : `${needsAttentionCount} urgent triage action${needsAttentionCount > 1 ? 's' : ''}`,
            icon: <AlertTriangle className="w-4 h-4 text-closr-danger"/>,
        },
    ];
    return (<div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-3 select-none', className)}>
      {cards.map((card) => {
            const isSelected = activeFilter === card.id;
            return (<button key={card.id} type="button" onClick={() => onSelectFilter(card.id)} className={cn('p-4 rounded-2xl border text-left transition-all flex items-start justify-between closr-focus group', isSelected
                    ? 'bg-closr-card border-closr-forest shadow-soft ring-1 ring-closr-forest/20'
                    : 'bg-closr-card/90 border-closr-border hover:bg-closr-card hover:border-closr-forest/40')}>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-closr-text-muted uppercase tracking-wider block">
                {card.title}
              </span>
              <span className="text-2xl font-serif font-bold text-closr-text block">
                {card.count}
              </span>
              <span className="text-[11px] text-closr-text-muted leading-tight block">
                {card.subtext}
              </span>
            </div>

            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors', isSelected ? 'bg-closr-forest text-white shadow-2xs' : 'bg-closr-sage/30')}>
              {card.icon}
            </div>
          </button>);
        })}
    </div>);
};
