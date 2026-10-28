import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext, useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { ConversationList } from '../components/messaging/ConversationList';
import { ConversationHeader } from '../components/messaging/ConversationHeader';
import { ConversationThread } from '../components/messaging/ConversationThread';
import { MessageComposer } from '../components/messaging/MessageComposer';
import { PatientContextPanel } from '../components/messaging/PatientContextPanel';
import { EscalationModal } from '../components/messaging/EscalationModal';
import { AppointmentDetailsModal } from '../components/appointments/AppointmentDetailsModal';
import { RescheduleAppointmentModal } from '../components/appointments/RescheduleAppointmentModal';
import { CancelAppointmentModal } from '../components/appointments/CancelAppointmentModal';
import { conversationService } from '../services/conversationService';
import { appointmentService } from '../services/appointmentService';
import { patientService } from '../services/patientService';
export const MessagesPage = () => {
    const { onOpenMobileMenu } = useOutletContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const toast = useToast();
    // State
    const [conversations, setConversations] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [messages, setMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    // Context Panel Data
    const [patient, setPatient] = useState(null);
    const [activeAppointment, setActiveAppointment] = useState(null);
    const [patientAppointments, setPatientAppointments] = useState([]);
    const [escalation, setEscalation] = useState(null);
    const [isContextOpen, setIsContextOpen] = useState(true);
    // Mobile navigation state (true = viewing conversation, false = viewing inbox list)
    const [showMobileConversation, setShowMobileConversation] = useState(false);
    // Modals state
    const [detailsAppointment, setDetailsAppointment] = useState(null);
    const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
    const [cancelAppointment, setCancelAppointment] = useState(null);
    const [isEscalationOpen, setIsEscalationOpen] = useState(false);
    // Load conversations on mount
    useEffect(() => {
        const loadInitialData = async () => {
            const convs = await conversationService.getConversations();
            setConversations(convs);
            // Check query param for initial conversation or booking code
            const queryId = searchParams.get('id');
            const queryBooking = searchParams.get('booking');
            if (queryId && convs.some((c) => c.id === queryId)) {
                setSelectedId(queryId);
                setShowMobileConversation(true);
            }
            else if (queryBooking) {
                const matching = convs.find((c) => c.bookingId === queryBooking);
                if (matching) {
                    setSelectedId(matching.id);
                    setShowMobileConversation(true);
                }
                else if (convs.length > 0) {
                    setSelectedId(convs[0].id);
                }
            }
            else if (convs.length > 0) {
                setSelectedId(convs[0].id);
            }
        };
        loadInitialData();
    }, [searchParams]);
    // Active selected conversation
    const selectedConversation = useMemo(() => conversations.find((c) => c.id === selectedId) || null, [conversations, selectedId]);
    // Load messages, patient details, appointment, and escalations when selected conversation changes
    const loadConversationData = useCallback(async (convId) => {
        setIsLoadingMessages(true);
        try {
            const msgs = await conversationService.getMessagesByConversationId(convId);
            setMessages(msgs);
            // Mark as read locally
            await conversationService.markAsRead(convId);
            setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c)));
            // Find the conversation to get patient and booking info
            const conv = await conversationService.getConversationById(convId);
            if (conv) {
                // Fetch patient
                const pat = await patientService.getPatientById(conv.patientId);
                setPatient(pat || null);
                // Fetch patient appointments
                const apts = await appointmentService.getAppointmentsByPatientId(conv.patientId);
                setPatientAppointments(apts);
                // Fetch active appointment if bookingId exists
                if (conv.bookingId) {
                    const match = apts.find((a) => a.bookingCode === conv.bookingId);
                    setActiveAppointment(match || apts[0] || null);
                }
                else {
                    setActiveAppointment(apts[0] || null);
                }
                // Fetch escalation
                const esc = await conversationService.getEscalationByPatientId(conv.patientId);
                setEscalation(esc || null);
            }
        }
        finally {
            setIsLoadingMessages(false);
        }
    }, []);
    useEffect(() => {
        if (selectedId) {
            loadConversationData(selectedId);
        }
    }, [selectedId, loadConversationData]);
    // Handle selecting a conversation from the list
    const handleSelectConversation = (id) => {
        setSelectedId(id);
        setShowMobileConversation(true);
        setSearchParams({ id });
    };
    // Back to inbox list on mobile
    const handleBackToInbox = () => {
        setShowMobileConversation(false);
    };
    // Sending a message
    const handleSendMessage = async (content, sender = 'doctor', type = 'text') => {
        if (!selectedId)
            return;
        // Send the doctor/user message
        const newMsg = await conversationService.sendMessage(selectedId, content, sender, type);
        setMessages((prev) => [...prev, newMsg]);
        // Update conversation snippet in inbox
        setConversations((prev) => prev.map((c) => c.id === selectedId
            ? { ...c, lastMessage: content, lastMessageTimestamp: newMsg.timestamp }
            : c));
        // Simulated Predefined Demo Assistant Response
        const lower = content.toLowerCase();
        // Trigger local demo response if relevant
        setTimeout(async () => {
            let replyContent = '';
            let replyType = 'text';
            let metadata;
            if (lower.includes('fever') || lower.includes('slot') || lower.includes('tomorrow') || lower.includes('appointment')) {
                replyContent = 'Dr. Sharma has appointments available tomorrow for a fever consultation: 5:00 PM, 5:30 PM, 6:15 PM. Which time works best for you?';
                replyType = 'quick-reply';
                metadata = { suggestedSlots: ['5:00 PM', '5:30 PM', '6:15 PM'] };
            }
            else if (lower.includes('5:30') || lower.includes('works for me') || lower.includes('confirm')) {
                replyContent = 'Your appointment has been confirmed. Doctor: Dr. Sharma, Date: October 29, Time: 5:30 PM, Booking ID: SAT-2041';
                replyType = 'card';
                metadata = { bookingId: 'SAT-2041' };
            }
            else if (lower.includes('breath') ||
                lower.includes('chest') ||
                lower.includes('pain') ||
                lower.includes('emergency')) {
                replyContent =
                    '⚠️ URGENT: Please contact local emergency services immediately or visit the nearest emergency room. The clinic triage desk has been notified.';
                replyType = 'text';
                // Auto trigger escalation record for safety
                await conversationService.escalateConversation(selectedId, 'Patient reported acute chest pain / respiratory distress (Demo Safety Trigger)', 'critical');
                const updatedEsc = await conversationService.getEscalationByPatientId(selectedConversation?.patientId || '');
                setEscalation(updatedEsc || null);
                setConversations((prev) => prev.map((c) => (c.id === selectedId ? { ...c, status: 'escalated' } : c)));
            }
            else if (lower.includes('fee') || lower.includes('fees') || lower.includes('charge') || lower.includes('timing') || lower.includes('hours') || lower.includes('opd')) {
                replyContent =
                    "Dr. Sharma's Clinic hours: Mon-Sat 9:00 AM - 1:00 PM and 5:00 PM - 8:30 PM. OPD consultation fee is ₹600.";
            }
            else if (lower.includes('human') || lower.includes('staff') || lower.includes('doctor')) {
                replyContent =
                    'Yes, the clinic triage desk and Dr. Sharma have been notified of your message. A staff member will assist you shortly.';
            }
            if (replyContent) {
                const assistantMsg = await conversationService.sendMessage(selectedId, replyContent, 'assistant', replyType, metadata);
                setMessages((prev) => [...prev, assistantMsg]);
                setConversations((prev) => prev.map((c) => c.id === selectedId
                    ? { ...c, lastMessage: replyContent, lastMessageTimestamp: assistantMsg.timestamp }
                    : c));
            }
        }, 700);
    };
    // Handle slot selection click from thread
    const handleSelectSlot = (slot) => {
        handleSendMessage(`${slot} works for me.`, 'user', 'text');
    };
    // Toggle resolved state
    const handleToggleResolved = async () => {
        if (!selectedId)
            return;
        try {
            const updated = await conversationService.toggleResolved(selectedId);
            setConversations((prev) => prev.map((c) => (c.id === selectedId ? updated : c)));
            toast.success(updated.isResolved
                ? 'Conversation marked as resolved (demo)'
                : 'Conversation reopened as active (demo)');
        }
        catch {
            toast.error('Failed to update conversation status');
        }
    };
    // Escalate to human triage
    const handleConfirmEscalation = async (reason, priority, notes) => {
        if (!selectedId)
            return;
        try {
            const result = await conversationService.escalateConversation(selectedId, reason, priority, notes);
            setConversations((prev) => prev.map((c) => (c.id === selectedId ? result.conversation : c)));
            setEscalation(result.escalation);
            toast.success(`Demo escalation ${result.escalation.id} registered with ${priority} priority`);
        }
        catch {
            toast.error('Could not register escalation');
        }
    };
    // Update escalation status (e.g. resolve)
    const handleUpdateEscalationStatus = async (escId, status) => {
        try {
            const updated = await conversationService.updateEscalationStatus(escId, status);
            setEscalation(updated);
            toast.success(`Escalation ${escId} marked as ${status} (demo)`);
        }
        catch {
            toast.error('Failed to update escalation status');
        }
    };
    // Navigation handlers
    const handleViewPatient = (patientId) => {
        navigate(`/patients?id=${patientId}`);
    };
    const handleViewAppointment = (apt) => {
        setDetailsAppointment(apt);
    };
    const handleReschedule = (apt) => {
        setDetailsAppointment(null);
        setRescheduleAppointment(apt);
    };
    const handleCancel = (apt) => {
        setDetailsAppointment(null);
        setCancelAppointment(apt);
    };
    // Synchronized appointment callbacks
    const handleAppointmentRescheduled = (updated) => {
        setPatientAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        if (activeAppointment?.id === updated.id) {
            setActiveAppointment(updated);
        }
        toast.success(`Appointment rescheduled to ${updated.date} at ${updated.time}`);
    };
    const handleAppointmentCancelled = (updated) => {
        setPatientAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        if (activeAppointment?.id === updated.id) {
            setActiveAppointment(updated);
        }
        toast.info('Appointment cancelled successfully (demo)');
    };
    // Unread conversations count
    const unreadTotal = useMemo(() => conversations.reduce((acc, c) => acc + (c.unreadCount > 0 ? 1 : 0), 0), [conversations]);
    return (<div className="space-y-4 h-[calc(100vh-5rem)] flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between shrink-0">
        <PageHeader title="Messages" subtitle="Conversations, bookings, and patient support in one place." onOpenMobileMenu={onOpenMobileMenu}/>
        <div className="flex items-center gap-2">
          {unreadTotal > 0 && (<Badge variant="danger" size="sm">
              {unreadTotal} Unread
            </Badge>)}
          <Badge variant="confirmed" size="sm">
            {conversations.length} Active Chats
          </Badge>
        </div>
      </div>

      {/* Main 3-Column Workspace Container */}
      <div className="flex-1 min-h-0 bg-closr-card rounded-2xl border border-closr-border shadow-soft overflow-hidden flex relative">
        {/* Left Column: Conversation Inbox (approx 280-320px) */}
        <div className={`w-full lg:w-80 shrink-0 h-full flex flex-col ${showMobileConversation ? 'hidden lg:flex' : 'flex'}`}>
          <ConversationList conversations={conversations} selectedId={selectedId} onSelectConversation={handleSelectConversation} searchQuery={searchQuery} onSearchChange={setSearchQuery} activeFilter={activeFilter} onFilterChange={setActiveFilter} className="h-full"/>
        </div>

        {/* Center Column: Active Conversation (Flexible width) */}
        <div className={`flex-1 h-full flex flex-col min-w-0 ${!showMobileConversation ? 'hidden lg:flex' : 'flex'}`}>
          {selectedConversation ? (<>
              {/* Conversation Header */}
              <ConversationHeader conversation={selectedConversation} onBackToInbox={handleBackToInbox} onViewPatient={() => handleViewPatient(selectedConversation.patientId)} onViewAppointment={() => {
                if (activeAppointment)
                    handleViewAppointment(activeAppointment);
                else
                    navigate('/appointments');
            }} onToggleResolved={handleToggleResolved} onOpenEscalation={() => setIsEscalationOpen(true)} onToggleContextPanel={() => setIsContextOpen(!isContextOpen)} isContextOpen={isContextOpen}/>

              {/* Message Thread */}
              <ConversationThread conversation={selectedConversation} messages={messages} appointment={activeAppointment || undefined} onViewAppointment={handleViewAppointment} onRescheduleAppointment={handleReschedule} onCancelAppointment={handleCancel} onSelectSlot={handleSelectSlot} isLoading={isLoadingMessages}/>

              {/* Message Composer */}
              <MessageComposer onSendMessage={handleSendMessage}/>
            </>) : (<div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-closr-text-muted">
              <p className="text-sm font-semibold text-closr-text">No conversation selected</p>
              <p className="text-xs mt-1">Select a patient from the inbox list to view messages.</p>
            </div>)}
        </div>

        {/* Right Column: Patient Context Panel (Desktop side-panel & Mobile drawer) */}
        {isContextOpen && (<div className={`fixed inset-y-0 right-0 z-40 lg:static lg:z-auto lg:flex h-full shadow-lg lg:shadow-none transition-transform duration-300 ${isContextOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
            <PatientContextPanel patient={patient} activeAppointment={activeAppointment} appointments={patientAppointments} escalation={escalation} onViewPatient={handleViewPatient} onViewAppointment={handleViewAppointment} onRescheduleAppointment={handleReschedule} onOpenEscalation={() => setIsEscalationOpen(true)} onUpdateEscalationStatus={handleUpdateEscalationStatus} onClose={() => setIsContextOpen(false)}/>
          </div>)}
      </div>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal isOpen={Boolean(detailsAppointment)} appointment={detailsAppointment} onClose={() => setDetailsAppointment(null)} onConfirm={async (apt) => {
            await appointmentService.updateAppointmentStatus(apt.id, 'confirmed');
            setDetailsAppointment(null);
            loadConversationData(selectedId);
            toast.success('Appointment confirmed (demo)');
        }} onReschedule={(apt) => handleReschedule(apt)} onCancel={(apt) => handleCancel(apt)}/>

      {/* Reschedule Appointment Modal */}
      <RescheduleAppointmentModal isOpen={Boolean(rescheduleAppointment)} appointment={rescheduleAppointment} onClose={() => setRescheduleAppointment(null)} onAppointmentRescheduled={handleAppointmentRescheduled}/>

      {/* Cancel Appointment Modal */}
      <CancelAppointmentModal isOpen={Boolean(cancelAppointment)} appointment={cancelAppointment} onClose={() => setCancelAppointment(null)} onAppointmentCancelled={handleAppointmentCancelled}/>

      {/* Escalation Modal */}
      <EscalationModal isOpen={isEscalationOpen} conversation={selectedConversation} initialReason={escalation?.reason} initialPriority={escalation?.priority || 'high'} onClose={() => setIsEscalationOpen(false)} onConfirm={handleConfirmEscalation}/>
    </div>);
};
