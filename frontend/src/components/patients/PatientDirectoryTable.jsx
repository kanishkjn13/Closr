import React from 'react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { Dropdown } from '../ui/Dropdown';
import { MoreVertical, Eye, Edit2, Calendar, MessageSquare, Users, Clock, Phone, Mail, } from 'lucide-react';
import { cn } from '../../lib/utils';
export const PatientDirectoryTable = ({ patients, appointments, onViewProfile, onEditPatient, onViewAppointments, onOpenConversation, onClearFilters, className, }) => {
    if (patients.length === 0) {
        return (<EmptyState icon={<Users className="w-6 h-6 text-closr-forest"/>} title="No patients found" description="There are no patient profiles matching your search query or filter selection." action={onClearFilters && (<button type="button" onClick={onClearFilters} className="text-xs font-semibold px-4 py-2 rounded-xl bg-closr-forest text-white hover:bg-closr-forest-hover transition-colors">
              Reset Filters
            </button>)}/>);
    }
    // Helper to find the next active appointment for a patient
    const getNextAppointment = (patient) => {
        const relevant = appointments.filter((a) => (a.patientId === patient.id ||
            a.patientName.toLowerCase().includes(patient.name.toLowerCase().split(' ')[0])) &&
            a.status !== 'cancelled');
        if (relevant.length === 0) {
            return patient.nextAppointment || null;
        }
        const first = relevant[0];
        return `${first.time} · ${first.date} (${first.doctorName})`;
    };
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge variant="active">Active</Badge>;
            case 'new':
                return <Badge variant="new">New Patient</Badge>;
            case 'follow-up':
                return <Badge variant="follow-up">Follow-up needed</Badge>;
            case 'inactive':
                return <Badge variant="inactive">Inactive</Badge>;
            default:
                return <Badge variant="neutral">{status}</Badge>;
        }
    };
    return (<div className={cn('bg-closr-card border border-closr-border rounded-2xl shadow-card overflow-hidden text-left', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-closr-border/80 bg-closr-bg/40 text-[11px] font-semibold text-closr-text-muted uppercase tracking-wider select-none">
              <th className="py-3 px-4 sm:px-6">Patient</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Next Appointment</th>
              <th className="py-3 px-4">Last Visit</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-closr-border/50 text-xs sm:text-[13px]">
            {patients.map((patient) => {
            const nextVisit = getNextAppointment(patient);
            const dropdownItems = [
                {
                    id: 'profile',
                    label: 'View profile',
                    icon: <Eye className="w-3.5 h-3.5"/>,
                    onClick: () => onViewProfile(patient),
                },
                {
                    id: 'edit',
                    label: 'Edit patient details',
                    icon: <Edit2 className="w-3.5 h-3.5 text-closr-forest"/>,
                    onClick: () => onEditPatient(patient),
                },
                {
                    id: 'appointments',
                    label: 'View appointments',
                    icon: <Calendar className="w-3.5 h-3.5 text-closr-forest"/>,
                    onClick: () => onViewAppointments(patient),
                },
                {
                    id: 'conversation',
                    label: 'Open receptionist chat',
                    icon: <MessageSquare className="w-3.5 h-3.5 text-closr-forest"/>,
                    onClick: () => onOpenConversation(patient),
                },
            ];
            return (<tr key={patient.id} onClick={() => onViewProfile(patient)} className="hover:bg-closr-sage/20 transition-colors group cursor-pointer">
                  {/* 1. Patient */}
                  <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar name={patient.name} size="sm" className="bg-closr-sage text-closr-forest font-semibold shrink-0"/>
                      <div className="min-w-0">
                        <span className="font-semibold text-closr-text block truncate">
                          {patient.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-closr-text-muted">
                          <span className="font-mono text-closr-forest/80 font-medium">
                            {patient.id}
                          </span>
                          {patient.conditionSummary && (<>
                              <span>•</span>
                              <span className="truncate max-w-[160px] opacity-80">
                                {patient.conditionSummary}
                              </span>
                            </>)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 2. Contact */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-closr-text flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-closr-forest shrink-0"/>
                        <span>{patient.phone}</span>
                      </p>
                      {patient.email && (<p className="text-[11px] text-closr-text-muted flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-closr-text-muted/70 shrink-0"/>
                          <span>{patient.email}</span>
                        </p>)}
                    </div>
                  </td>

                  {/* 3. Next Appointment */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {nextVisit ? (<div className="flex items-center gap-1.5 font-medium text-closr-text">
                        <Clock className="w-3.5 h-3.5 text-closr-forest shrink-0"/>
                        <span>{nextVisit}</span>
                      </div>) : (<span className="text-closr-text-muted text-xs italic">
                        No upcoming visit
                      </span>)}
                  </td>

                  {/* 4. Last Visit */}
                  <td className="py-3.5 px-4 text-closr-text-muted whitespace-nowrap">
                    {patient.lastVisit ? patient.lastVisit : '—'}
                  </td>

                  {/* 5. Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {renderStatusBadge(patient.status)}
                  </td>

                  {/* 6. Actions Dropdown */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <Dropdown align="right" trigger={<button type="button" aria-label={`Actions for ${patient.name}`} className="p-1 rounded-lg hover:bg-closr-sage/50 text-closr-text-muted hover:text-closr-text transition-colors closr-focus">
                          <MoreVertical className="w-4 h-4"/>
                        </button>} items={dropdownItems}/>
                  </td>
                </tr>);
        })}
          </tbody>
        </table>
      </div>

      {/* Footer info */}
      <div className="px-5 py-3 border-t border-closr-border/60 bg-closr-bg/20 text-[11px] text-closr-text-muted flex items-center justify-between">
        <span>Showing {patients.length} patient records</span>
        <span className="italic">Local demo clinic directory</span>
      </div>
    </div>);
};
