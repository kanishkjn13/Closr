import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppointmentRow } from './AppointmentRow';
export const AppointmentsCard = ({ appointments, onSelectAppointment, doctorName = 'Dr. Sharma', }) => {
    const navigate = useNavigate();
    // Take the first 4 rows to match reference screenshot
    const displayedAppointments = appointments.slice(0, 4);
    return (<div className="bg-closr-card border border-closr-border rounded-2xl shadow-card overflow-hidden mb-6 sm:mb-8 text-left">
      {/* Card Header matching screenshot: Title & View all on same horizontal line */}
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-closr-border/70">
        <h2 className="text-sm sm:text-base font-medium text-closr-text tracking-tight flex items-center gap-1.5">
          <span>Appointments</span>
          <span className="text-closr-text-muted">·</span>
          <span>{doctorName}</span>
        </h2>
        <button type="button" onClick={() => navigate('/appointments')} className="text-xs sm:text-[13px] font-medium text-closr-text-muted hover:text-closr-forest transition-colors closr-focus rounded-lg px-2 py-1">
          View all
        </button>
      </div>

      {/* Rows Container */}
      <div className="divide-y divide-transparent">
        {displayedAppointments.map((appointment, index) => (<AppointmentRow key={appointment.id} appointment={appointment} onSelect={onSelectAppointment} isLast={index === displayedAppointments.length - 1}/>))}
      </div>
    </div>);
};
