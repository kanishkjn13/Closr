import React from 'react';
import { SearchInput } from '../ui/SearchInput';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
export const PatientFiltersToolbar = ({ searchQuery, onSearchChange, statusFilter, onStatusFilterChange, upcomingFilter, onUpcomingFilterChange, onClearFilters, className, }) => {
    const isFiltered = Boolean(searchQuery) || statusFilter !== 'all' || upcomingFilter !== 'all';
    return (<div className={cn('p-3.5 sm:p-4 rounded-2xl bg-closr-card border border-closr-border shadow-xs space-y-3 select-none', className)}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input */}
        <div className="flex-1 min-w-[240px]">
          <SearchInput value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} onClear={() => onSearchChange('')} placeholder="Search patients by name, phone, or patient ID..."/>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-closr-text-muted hidden sm:inline">
              Status:
            </span>
            <select aria-label="Filter by patient status" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} className="text-xs py-2 px-3 rounded-xl bg-closr-bg/50 border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest cursor-pointer">
              <option value="all">All Patients</option>
              <option value="active">Active</option>
              <option value="new">New</option>
              <option value="follow-up">Follow-up needed</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Upcoming Visits Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-closr-text-muted hidden sm:inline">
              Visits:
            </span>
            <select aria-label="Filter by upcoming visits" value={upcomingFilter} onChange={(e) => onUpcomingFilterChange(e.target.value)} className="text-xs py-2 px-3 rounded-xl bg-closr-bg/50 border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest cursor-pointer">
              <option value="all">All Visits</option>
              <option value="has-upcoming">Upcoming visit scheduled</option>
              <option value="no-upcoming">No upcoming visit</option>
            </select>
          </div>

          {/* Clear Filters */}
          {isFiltered && (<button type="button" onClick={onClearFilters} className="inline-flex items-center gap-1 text-xs py-1.5 px-2.5 rounded-xl text-closr-danger hover:bg-closr-danger-bg transition-colors font-medium border border-closr-danger/20">
              <X className="w-3.5 h-3.5"/>
              <span>Clear filters</span>
            </button>)}
        </div>
      </div>
    </div>);
};
