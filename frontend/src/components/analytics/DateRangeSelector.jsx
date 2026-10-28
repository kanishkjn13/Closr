import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Calendar, RefreshCw, Download, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
export const DateRangeSelector = ({ selectedPreset, startDate, endDate, onPresetChange, onCustomRangeApply, onRefresh, onExport, isRefreshing = false, isExporting = false, className, }) => {
    const [customStart, setCustomStart] = useState(startDate);
    const [customEnd, setCustomEnd] = useState(endDate);
    const [validationError, setValidationError] = useState('');
    const presets = [
        { id: 'today', label: 'Today' },
        { id: '7d', label: 'Last 7 Days' },
        { id: '30d', label: 'Last 30 Days' },
        { id: '90d', label: 'Last 90 Days' },
        { id: 'custom', label: 'Custom Range' },
    ];
    const handleApplyCustom = (e) => {
        e.preventDefault();
        if (!customStart || !customEnd) {
            setValidationError('Please select both start and end dates');
            return;
        }
        if (customStart > customEnd) {
            setValidationError('Start date cannot be after end date');
            return;
        }
        setValidationError('');
        onCustomRangeApply(customStart, customEnd);
    };
    return (<div className={cn('space-y-3 select-none', className)}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-closr-card p-3 rounded-2xl border border-closr-border shadow-soft">
        {/* Preset Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
          {presets.map((preset) => {
            const isActive = selectedPreset === preset.id;
            return (<button key={preset.id} type="button" onClick={() => {
                    setValidationError('');
                    onPresetChange(preset.id);
                }} className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all closr-focus', isActive
                    ? 'bg-closr-forest text-white shadow-soft'
                    : 'text-closr-text-muted hover:text-closr-text hover:bg-closr-sage/30')}>
                {preset.label}
              </button>);
        })}
        </div>

        {/* Action Controls & Demo Indicator */}
        <div className="flex items-center gap-2 justify-end">
          <Badge variant="neutral" size="sm" className="hidden sm:inline-flex bg-[#EDEBE3] text-closr-text-muted border-closr-border">
            Demo Data
          </Badge>

          {/* Refresh Button */}
          <button type="button" onClick={onRefresh} disabled={isRefreshing} aria-label="Refresh analytics data" className="p-2 rounded-xl bg-white border border-closr-border text-closr-text hover:bg-closr-sage/30 hover:border-closr-forest/40 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-2xs closr-focus disabled:opacity-50">
            <RefreshCw className={cn('w-3.5 h-3.5 text-closr-forest', isRefreshing && 'animate-spin')}/>
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Report Button */}
          <button type="button" onClick={onExport} disabled={isExporting} className="px-3 py-2 rounded-xl bg-white border border-closr-border text-closr-forest hover:bg-closr-sage/30 hover:border-closr-forest/50 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-2xs closr-focus disabled:opacity-50">
            <Download className="w-3.5 h-3.5"/>
            <span>Export Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* Custom Range Drawer / Inline Inputs when Custom Range is selected */}
      {selectedPreset === 'custom' && (<form onSubmit={handleApplyCustom} className="p-3.5 rounded-2xl bg-white border border-closr-border shadow-soft flex flex-wrap items-center gap-3 animate-fadeIn text-xs">
          <div className="flex items-center gap-1.5 text-closr-forest font-semibold">
            <Calendar className="w-4 h-4"/>
            <span>Select Range:</span>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="custom-start" className="text-closr-text-muted">
              From:
            </label>
            <input id="custom-start" type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="px-2.5 py-1.5 rounded-xl border border-closr-border bg-closr-card text-closr-text text-xs focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20"/>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="custom-end" className="text-closr-text-muted">
              To:
            </label>
            <input id="custom-end" type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="px-2.5 py-1.5 rounded-xl border border-closr-border bg-closr-card text-closr-text text-xs focus:outline-hidden focus:ring-2 focus:ring-closr-forest/20"/>
          </div>

          <button type="submit" className="px-3 py-1.5 rounded-xl bg-closr-forest text-white font-semibold text-xs hover:bg-closr-forest-hover transition-colors shadow-2xs">
            Apply Range
          </button>

          {validationError && (<div className="flex items-center gap-1 text-closr-danger text-xs pl-2 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0"/>
              <span>{validationError}</span>
            </div>)}
        </form>)}
    </div>);
};
