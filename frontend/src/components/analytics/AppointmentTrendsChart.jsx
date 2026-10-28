import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, } from 'recharts';
import { TrendingUp, CalendarX } from 'lucide-react';
import { cn } from '../../lib/utils';
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (<div className="p-3 rounded-xl bg-white border border-closr-border shadow-soft text-xs space-y-1.5 min-w-[160px] text-left">
        <p className="font-semibold text-closr-text pb-1 border-b border-closr-border/60">
          {label}
        </p>
        {payload.map((entry, index) => (<div key={`item-${index}`} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-closr-text-muted">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }}/>
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-closr-text">{entry.value}</span>
          </div>))}
      </div>);
    }
    return null;
};
export const AppointmentTrendsChart = ({ data, className, }) => {
    const hasData = data.length > 0 && data.some((d) => d.total > 0);
    return (<div className={cn('p-5 rounded-2xl bg-closr-card border border-closr-border shadow-soft flex flex-col justify-between text-left space-y-4', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h3 className="font-serif font-bold text-base text-closr-text flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-closr-forest"/>
            Appointment Trends
          </h3>
          <p className="text-xs text-closr-text-muted mt-0.5">Appointment activity over time</p>
        </div>

        {hasData && (<span className="text-[11px] font-medium text-closr-text-muted">
            Daily appointment breakdown
          </span>)}
      </div>

      {/* Chart Canvas or Empty State */}
      <div className="w-full h-72 sm:h-80 flex items-center justify-center">
        {!hasData ? (<div className="text-center p-6 space-y-2 text-closr-text-muted max-w-sm">
            <div className="w-12 h-12 rounded-full bg-closr-sage/30 flex items-center justify-center text-closr-forest mx-auto mb-2">
              <CalendarX className="w-6 h-6"/>
            </div>
            <h4 className="font-semibold text-sm text-closr-text">No Appointment Trends Found</h4>
            <p className="text-xs leading-relaxed">
              No appointment records exist within this selected date range. Try selecting "Last 7
              Days" or "Last 30 Days" to inspect clinic trends.
            </p>
          </div>) : (<ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E4DA"/>
              <XAxis dataKey="formattedDate" tick={{ fill: '#77817A', fontSize: 11 }} axisLine={{ stroke: '#E6E4DA' }} tickLine={false}/>
              <YAxis allowDecimals={false} tick={{ fill: '#77817A', fontSize: 11 }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip />}/>
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 15, fontSize: 11, color: '#77817A' }}/>
              <Line type="monotone" dataKey="total" name="Total Appointments" stroke="#77817A" strokeWidth={2} dot={{ r: 3, fill: '#77817A' }} activeDot={{ r: 5 }}/>
              <Line type="monotone" dataKey="confirmed" name="Confirmed" stroke="#174F43" strokeWidth={2.5} dot={{ r: 3.5, fill: '#174F43' }} activeDot={{ r: 6 }}/>
              <Line type="monotone" dataKey="cancelled" name="Cancelled" stroke="#B77D43" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: '#B77D43' }} activeDot={{ r: 5 }}/>
            </LineChart>
          </ResponsiveContainer>)}
      </div>
    </div>);
};
