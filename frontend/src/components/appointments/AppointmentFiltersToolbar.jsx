import React from 'react';
import { SearchInput } from '../ui/SearchInput';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
export const AppointmentFiltersToolbar = ({ searchQuery, onSearchChange, statusFilter, onStatusFilterChange, doctorFilter, onDoctorFilterChange, serviceFilter, onServiceFilterChange, onClearFilters, className, }) => {
    const isFiltered = Boolean(searchQuery) ||
        statusFilter !== 'all' ||
        doctorFilter !== 'all' ||
        serviceFilter !== 'all';
    return (<div className={cn('p-3.5 sm:p-4 rounded-2xl bg-closr-card border border-closr-border shadow-xs space-y-3 select-none', className)}>
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[240px]">
          <SearchInput value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} onClear={() => onSearchChange('')} placeholder="Search by patient, doctor, or booking ID..."/>
        </div>

        {/* Dropdowns for Doctor, Service, and Status */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-closr-text-muted hidden sm:inline">
              Status:
            </span>
            <select aria-label="Filter by appointment status" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} className="text-xs py-2 px-3 rounded-xl bg-closr-bg/50 border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest cursor-pointer">
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Doctor Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-closr-text-muted hidden sm:inline">
              Doctor:
            </span>
            <select aria-label="Filter by consulting doctor" value={doctorFilter} onChange={(e) => onDoctorFilterChange(e.target.value)} className="text-xs py-2 px-3 rounded-xl bg-closr-bg/50 border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest cursor-pointer">
              <option value="all">All Doctors</option>
              <option value="Dr. Sharma">Dr. Sharma</option>
              <option value="Dr. Verma">Dr. Verma</option>
            </select>
          </div>

          {/* Service Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium text-closr-text-muted hidden sm:inline">
              Service:
            </span>
            <select aria-label="Filter by clinical service" value={serviceFilter} onChange={(e) => onServiceFilterChange(e.target.value)} className="text-xs py-2 px-3 rounded-xl bg-closr-bg/50 border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest cursor-pointer">
              <option value="all">All Services</option>
              <option value="Follow-up">Follow-up</option>
              <option value="General consultation">General consultation</option>
              <option value="Fever consultation">Fever consultation</option>
              <option value="New patient consultation">New patient consultation</option>
              <option value="Routine checkup">Routine checkup</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {isFiltered && (<button type="button" onClick={onClearFilters} className="inline-flex items-center gap-1 text-xs py-1.5 px-2.5 rounded-xl text-closr-danger hover:bg-closr-danger-bg transition-colors font-medium border border-closr-danger/20">
              <X className="w-3.5 h-3.5"/>
              <span>Clear filters</span>
            </button>)}
        </div>
      </div>
    </div>);
};
