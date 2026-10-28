import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieChartIcon, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
export const AppointmentStatusDonut = ({ distribution, totalAppointments, className, }) => {
    const navigate = useNavigate();
    const hasData = totalAppointments > 0;
    // Filter items that have at least 1 count for the donut segments
    const activeSegments = distribution.filter((item) => item.count > 0);
    const handleStatusClick = (status) => {
        navigate(`/appointments?status=${status}`);
    };
    return (<div className={cn('p-5 rounded-2xl bg-closr-card border border-closr-border shadow-soft flex flex-col justify-between text-left space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif font-bold text-base text-closr-text flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-closr-forest"/>
            Appointment Status
          </h3>
          <p className="text-xs text-closr-text-muted mt-0.5">
            Breakdown across {totalAppointments} appointment{totalAppointments !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Donut Chart & Legend */}
      {!hasData ? (<div className="h-64 flex flex-col items-center justify-center text-center p-6 text-closr-text-muted">
          <p className="text-xs font-semibold text-closr-text">No Appointment Data</p>
          <p className="text-[11px] mt-1">Zero appointments found in this time range.</p>
        </div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* Donut graphic */}
          <div className="relative w-full h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={activeSegments} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3}>
                  {activeSegments.map((entry) => (<Cell key={`cell-${entry.status}`} fill={entry.color}/>))}
                </Pie>
                <Tooltip formatter={(val, name) => [`${val || 0} appointments`, String(name || '')]} contentStyle={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                borderColor: '#E6E4DA',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(23,79,67,0.06)',
            }}/>
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="font-serif font-bold text-xl text-closr-text leading-none">
                {totalAppointments}
              </span>
              <span className="text-[10px] uppercase font-semibold text-closr-text-muted mt-0.5">
                Total
              </span>
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="space-y-2">
            {distribution.map((item) => (<button key={item.status} type="button" onClick={() => handleStatusClick(item.status)} title={`Filter Appointments by ${item.label}`} className="w-full p-2 rounded-xl bg-white border border-closr-border/80 hover:border-closr-forest hover:bg-closr-sage/20 transition-all flex items-center justify-between text-xs group">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}/>
                  <span className="font-semibold text-closr-text text-[11px] group-hover:text-closr-forest transition-colors">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-closr-text text-[11px]">
                    {item.count}
                  </span>
                  <span className="text-[10px] text-closr-text-muted bg-closr-sage/40 px-1.5 py-0.5 rounded">
                    {item.percentage}%
                  </span>
                  <ExternalLink className="w-3 h-3 text-closr-text-muted opacity-0 group-hover:opacity-100 transition-opacity"/>
                </div>
              </button>))}
          </div>
        </div>)}
    </div>);
};
