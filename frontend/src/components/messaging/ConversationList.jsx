import React from 'react';
import { ConversationListItem } from './ConversationListItem';
import { SearchInput } from '../ui/SearchInput';
import { cn } from '../../lib/utils';
import { MessageSquare, Inbox } from 'lucide-react';
export const ConversationList = ({ conversations, selectedId, onSelectConversation, searchQuery, onSearchChange, activeFilter, onFilterChange, className, }) => {
    const filterPills = [
        { id: 'all', label: 'All' },
        { id: 'unread', label: 'Unread' },
        { id: 'attention', label: 'Needs attention' },
        { id: 'booking', label: 'Bookings' },
        { id: 'escalated', label: 'Escalated' },
    ];
    return (<div className={cn('w-full lg:w-[320px] shrink-0 flex flex-col h-full bg-closr-card border-r border-closr-border select-none text-left', className)}>
      {/* Top Header & Search */}
      <div className="p-4 border-b border-closr-border/80 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-closr-text tracking-tight flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-closr-forest"/>
            <span>Inbox</span>
          </h2>
          <span className="text-xs font-semibold text-closr-text-muted bg-closr-bg px-2 py-0.5 rounded-full border border-closr-border">
            {conversations.length}
          </span>
        </div>

        <SearchInput value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} onClear={() => onSearchChange('')} placeholder="Search by patient, message..." className="text-xs"/>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterPills.map((pill) => {
            const isActive = activeFilter === pill.id;
            return (<button key={pill.id} type="button" onClick={() => onFilterChange(pill.id)} className={cn('text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors shrink-0', isActive
                    ? 'bg-closr-forest text-white font-semibold shadow-xs'
                    : 'bg-closr-bg text-closr-text-muted hover:text-closr-text hover:bg-closr-sage/30 border border-closr-border/60')}>
                {pill.label}
              </button>);
        })}
        </div>
      </div>

      {/* Conversations Scroll Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 ? (<div className="p-8 text-center text-xs text-closr-text-muted space-y-2">
            <Inbox className="w-6 h-6 text-closr-forest mx-auto opacity-40"/>
            <p>No conversations match your filter.</p>
          </div>) : (conversations.map((c) => (<ConversationListItem key={c.id} conversation={c} isSelected={c.id === selectedId} onSelect={() => onSelectConversation(c.id)}/>)))}
      </div>
    </div>);
};
