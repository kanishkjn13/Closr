import React from 'react';
import { SearchInput } from '../ui/SearchInput';
import { ArrowUpDown, RotateCcw, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
export const NotificationFiltersToolbar = ({ searchQuery, onSearchChange, readFilter, onReadFilterChange, categoryFilter, onCategoryFilterChange, priorityFilter, onPriorityFilterChange, sortOrder, onSortOrderChange, onResetFilters, hasActiveFilters, className, }) => {
    return (<div className={cn('p-3.5 rounded-2xl bg-closr-card border border-closr-border shadow-soft space-y-3 select-none text-left', className)}>
      {/* Top Row: Search Input + Sorting + Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <SearchInput value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} onClear={() => onSearchChange('')} placeholder="Search by title, patient, booking ID, or escalation..."/>
        </div>

        <div className="flex items-center gap-2 justify-end">
          {/* Sort Order Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-closr-border rounded-xl px-2.5 py-1.5 text-xs text-closr-text">
            <ArrowUpDown className="w-3.5 h-3.5 text-closr-forest shrink-0"/>
            <select value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value)} className="bg-transparent font-medium text-closr-text focus:outline-hidden text-xs cursor-pointer">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (<button type="button" onClick={onResetFilters} className="py-1.5 px-2.5 rounded-xl text-xs font-semibold text-closr-forest hover:bg-closr-sage/30 flex items-center gap-1 transition-colors">
              <RotateCcw className="w-3 h-3"/>
              <span>Reset</span>
            </button>)}
        </div>
      </div>

      {/* Bottom Row: Filter Tabs & Selectors */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-closr-border/60">
        <div className="flex items-center gap-1 mr-2 text-closr-text-muted text-xs font-medium">
          <Filter className="w-3.5 h-3.5 text-closr-forest"/>
          <span className="hidden sm:inline">Filters:</span>
        </div>

        {/* Read Status Filter Pills */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-xl border border-closr-border">
          {[
            { id: 'all', label: 'All' },
            { id: 'unread', label: 'Unread' },
            { id: 'read', label: 'Read' },
        ].map((tab) => (<button key={tab.id} type="button" onClick={() => onReadFilterChange(tab.id)} className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold transition-all', readFilter === tab.id
                ? 'bg-closr-forest text-white shadow-2xs'
                : 'text-closr-text-muted hover:text-closr-text hover:bg-closr-sage/20')}>
              {tab.label}
            </button>))}
        </div>

        {/* Category Dropdown */}
        <select value={categoryFilter} onChange={(e) => onCategoryFilterChange(e.target.value)} className="px-2.5 py-1.5 text-xs font-medium rounded-xl bg-white border border-closr-border text-closr-text focus:outline-hidden focus:ring-1 focus:ring-closr-forest/20 cursor-pointer">
          <option value="all">All Categories</option>
          <option value="appointments">Appointments</option>
          <option value="conversations">Conversations</option>
          <option value="escalations">Clinical Escalations</option>
          <option value="activity">Clinic Activity</option>
          <option value="system">System Notices</option>
        </select>

        {/* Priority Dropdown */}
        <select value={priorityFilter} onChange={(e) => onPriorityFilterChange(e.target.value)} className="px-2.5 py-1.5 text-xs font-medium rounded-xl bg-white border border-closr-border text-closr-text focus:outline-hidden focus:ring-1 focus:ring-closr-forest/20 cursor-pointer">
          <option value="all">All Priorities</option>
          <option value="normal">Normal</option>
          <option value="high">High Priority</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
    </div>);
};
