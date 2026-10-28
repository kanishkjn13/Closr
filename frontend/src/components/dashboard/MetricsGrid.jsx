import React from 'react';
import { Calendar, User, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MetricCard } from './MetricCard';
export const MetricsGrid = ({ onOpenEscalationModal }) => {
    const navigate = useNavigate();
    return (<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
      {/* Metric 1 — Bookings */}
      <MetricCard icon={<Calendar className="w-4 h-4 text-closr-forest stroke-[2]"/>} iconBg="bg-closr-pale" iconColor="text-closr-forest" value={14} label="Bookings" comparison="↑ 2 more than yesterday" tone="green" onClick={() => navigate('/appointments')}/>

      {/* Metric 2 — No-shows */}
      <MetricCard icon={<User className="w-4 h-4 text-closr-text/70 stroke-[2]"/>} iconBg="bg-closr-sage/60" iconColor="text-closr-text" value={3} label="No-Shows Today" comparison="↓ 1 less than yesterday" tone="neutral" onClick={() => navigate('/appointments')}/>

      {/* Metric 3 — Human assistance */}
      <MetricCard icon={<UserRound className="w-4 h-4 text-closr-amber stroke-[2]"/>} iconBg="bg-closr-amber-badge" iconColor="text-closr-amber" value={1} label="Human Assistance Required" comparison="↑ 1 (escalation)" tone="amber" onClick={onOpenEscalationModal}/>
    </div>);
};
