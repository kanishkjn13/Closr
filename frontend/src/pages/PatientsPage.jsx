import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { PatientSummaryCards } from '../components/patients/PatientSummaryCards';
import { PatientFiltersToolbar } from '../components/patients/PatientFiltersToolbar';
import { PatientDirectoryTable } from '../components/patients/PatientDirectoryTable';
import { PatientProfileDrawer } from '../components/patients/PatientProfileDrawer';
import { AddPatientModal } from '../components/patients/AddPatientModal';
import { EditPatientModal } from '../components/patients/EditPatientModal';
import { useToast } from '../components/ui/Toast';
import { patientService } from '../services/patientService';
import { appointmentService } from '../services/appointmentService';
import { UserPlus } from 'lucide-react';
export const PatientsPage = () => {
    const { onOpenMobileMenu } = useOutletContext();
    const navigate = useNavigate();
    const toast = useToast();
    // Patients and Appointments data
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [upcomingFilter, setUpcomingFilter] = useState('all');
    // Modals & Drawer state
    const [selectedPatientForDrawer, setSelectedPatientForDrawer] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [patientToEdit, setPatientToEdit] = useState(null);
    // Load patients and appointments
    const loadData = async () => {
        try {
            setIsLoading(true);
            const [pts, apts] = await Promise.all([
                patientService.getPatients(),
                appointmentService.getAppointments(),
            ]);
            setPatients(pts);
            setAppointments(apts);
        }
        catch {
            toast.error('Failed to load patient records');
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        loadData();
    }, []);
    // Summary Metrics calculations
    const summaryMetrics = useMemo(() => {
        const total = patients.length;
        const newPatientsCount = patients.filter((p) => p.status === 'new').length;
        const followUpCount = patients.filter((p) => p.status === 'follow-up').length;
        // Count unique patients with at least one active, non-cancelled appointment
        const upcomingPatientIds = new Set(appointments
            .filter((a) => a.status !== 'cancelled')
            .map((a) => a.patientId));
        const upcomingVisitsCount = patients.filter((p) => upcomingPatientIds.has(p.id)).length;
        return { total, upcomingVisitsCount, newPatientsCount, followUpCount };
    }, [patients, appointments]);
    // Filtered patients
    const filteredPatients = useMemo(() => {
        return patients.filter((patient) => {
            // 1. Status Filter
            if (statusFilter !== 'all' && patient.status !== statusFilter) {
                return false;
            }
            // 2. Upcoming Visits Filter
            if (upcomingFilter !== 'all') {
                const hasUpcoming = appointments.some((a) => (a.patientId === patient.id ||
                    a.patientName.toLowerCase().includes(patient.name.toLowerCase().split(' ')[0])) &&
                    a.status !== 'cancelled');
                if (upcomingFilter === 'has-upcoming' && !hasUpcoming)
                    return false;
                if (upcomingFilter === 'no-upcoming' && hasUpcoming)
                    return false;
            }
            // 3. Search Query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const matchesName = patient.name.toLowerCase().includes(query);
                const matchesPhone = patient.phone.includes(query);
                const matchesId = patient.id.toLowerCase().includes(query);
                const matchesEmail = patient.email?.toLowerCase().includes(query);
                if (!matchesName && !matchesPhone && !matchesId && !matchesEmail) {
                    return false;
                }
            }
            return true;
        });
    }, [patients, appointments, statusFilter, upcomingFilter, searchQuery]);
    const handleOpenDrawer = (patient) => {
        setSelectedPatientForDrawer(patient);
        setIsDrawerOpen(true);
    };
    const handleEditPatient = (patient) => {
        setPatientToEdit(patient);
    };
    const handleViewAppointments = (patient) => {
        setIsDrawerOpen(false);
        navigate(`/appointments?search=${encodeURIComponent(patient.name.split(' ')[0])}`);
    };
    const handleOpenConversation = (patient) => {
        setIsDrawerOpen(false);
        // Connects to mobile receptionist chat or messages
        navigate('/receptionist');
        toast.info('Receptionist Chat', `Opened active triage conversation for ${patient.name}.`);
    };
    const handleClearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setUpcomingFilter('all');
    };
    return (<div className="space-y-6 sm:space-y-7 text-closr-text animate-in fade-in duration-200">
      {/* 1. Header with Title, Subtitle, and Primary "Add patient" Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader title="Patients" subtitle="Manage patient profiles, appointments, and conversations." onOpenMobileMenu={onOpenMobileMenu} actions={<Button variant="primary" leftIcon={<UserPlus className="w-4 h-4"/>} onClick={() => setIsAddModalOpen(true)}>
              Add patient
            </Button>}/>
      </div>

      {/* 2. Patient Summary Cards */}
      <PatientSummaryCards total={summaryMetrics.total} upcomingVisitsCount={summaryMetrics.upcomingVisitsCount} newPatientsCount={summaryMetrics.newPatientsCount} followUpCount={summaryMetrics.followUpCount} activeStatusFilter={statusFilter} onSelectStatusFilter={(status) => setStatusFilter(status)}/>

      {/* 3. Search and Filter Toolbar */}
      <PatientFiltersToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} upcomingFilter={upcomingFilter} onUpcomingFilterChange={setUpcomingFilter} onClearFilters={handleClearFilters}/>

      {/* 4. Patient Directory Table */}
      {isLoading ? (<div className="p-12 text-center text-xs text-closr-text-muted">
          Loading patient directory...
        </div>) : (<PatientDirectoryTable patients={filteredPatients} appointments={appointments} onViewProfile={handleOpenDrawer} onEditPatient={handleEditPatient} onViewAppointments={handleViewAppointments} onOpenConversation={handleOpenConversation} onClearFilters={handleClearFilters}/>)}

      {/* 5. Patient Profile Slide-over Drawer */}
      <PatientProfileDrawer patient={selectedPatientForDrawer} isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onEditPatient={(p) => {
            setIsDrawerOpen(false);
            handleEditPatient(p);
        }} onViewAppointments={handleViewAppointments} onOpenConversation={handleOpenConversation} appointments={appointments}/>

      {/* 6. Add Patient Modal */}
      <AddPatientModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onPatientCreated={(newPatient) => {
            setPatients((prev) => [newPatient, ...prev]);
            toast.success('Patient Registered (Demo)', `Profile created for ${newPatient.name} (${newPatient.id}).`);
        }}/>

      {/* 7. Edit Patient Modal */}
      <EditPatientModal patient={patientToEdit} isOpen={Boolean(patientToEdit)} onClose={() => setPatientToEdit(null)} onPatientUpdated={(updated) => {
            setPatients((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            if (selectedPatientForDrawer && selectedPatientForDrawer.id === updated.id) {
                setSelectedPatientForDrawer(updated);
            }
            toast.success('Patient Profile Updated', `Changes saved for ${updated.name} (${updated.id}).`);
        }}/>
    </div>);
};
