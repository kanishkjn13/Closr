import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
export const DateNavigator = ({ currentDate, onDateChange, className, }) => {
    const todayStr = '2026-10-29'; // Base reference clinic date
    // Helper to format date string to "Thu, Oct 29, 2026" style
    const formatDisplayDate = (dateStr) => {
        const parts = dateStr.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dayName = weekdays[d.getDay()];
        const monthName = months[d.getMonth()];
        return `${dayName}, ${monthName} ${day}, ${year}`;
    };
    const handlePrevDay = () => {
        const parts = currentDate.split('-');
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        d.setDate(d.getDate() - 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        onDateChange(`${y}-${m}-${day}`);
    };
    const handleNextDay = () => {
        const parts = currentDate.split('-');
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        d.setDate(d.getDate() + 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        onDateChange(`${y}-${m}-${day}`);
    };
    const isToday = currentDate === todayStr;
    return (<div className={cn('flex flex-wrap items-center justify-between gap-3 p-3 sm:px-4 rounded-2xl bg-closr-card border border-closr-border select-none shadow-xs', className)}>
      {/* Date navigation controls */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={handlePrevDay} aria-label="Previous day" className="w-8 h-8 rounded-xl border border-closr-border bg-closr-bg/50 flex items-center justify-center text-closr-text hover:bg-closr-sage/40 transition-colors closr-focus active:scale-95">
          <ChevronLeft className="w-4 h-4 stroke-[2.2]"/>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-closr-bg/40 border border-closr-border/60">
          <CalendarIcon className="w-4 h-4 text-closr-forest shrink-0"/>
          <span className="text-xs sm:text-[13px] font-semibold text-closr-text tracking-tight">
            {formatDisplayDate(currentDate)}
          </span>
        </div>

        <button type="button" onClick={handleNextDay} aria-label="Next day" className="w-8 h-8 rounded-xl border border-closr-border bg-closr-bg/50 flex items-center justify-center text-closr-text hover:bg-closr-sage/40 transition-colors closr-focus active:scale-95">
          <ChevronRight className="w-4 h-4 stroke-[2.2]"/>
        </button>
      </div>

      {/* Date picker jump & "Today" button */}
      <div className="flex items-center gap-2.5">
        <input type="date" aria-label="Choose specific date" value={currentDate} onChange={(e) => e.target.value && onDateChange(e.target.value)} className="text-xs py-1.5 px-2.5 rounded-xl bg-closr-bg/50 border border-closr-border text-closr-text focus:outline-none focus:ring-1 focus:ring-closr-forest cursor-pointer"/>

        {!isToday && (<button type="button" onClick={() => onDateChange(todayStr)} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-closr-sage/60 text-closr-forest hover:bg-closr-sage transition-colors border border-closr-border/60">
            Today
          </button>)}
      </div>
    </div>);
};
