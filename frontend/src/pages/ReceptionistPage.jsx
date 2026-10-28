import React, { useState, useRef, useEffect } from 'react';
import { ReceptionistHeader } from '../components/receptionist/ReceptionistHeader';
import { MessageBubble } from '../components/receptionist/MessageBubble';
import { AppointmentSlotPicker } from '../components/receptionist/AppointmentSlotPicker';
import { CalendarCheckStatus } from '../components/receptionist/CalendarCheckStatus';
import { VoiceNotePlayer } from '../components/receptionist/VoiceNotePlayer';
import { BookingConfirmationCard } from '../components/receptionist/BookingConfirmationCard';
import { MessageComposer } from '../components/receptionist/MessageComposer';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { appointmentService } from '../services/appointmentService';
export const ReceptionistPage = () => {
    const toast = useToast();
    const chatEndRef = useRef(null);
    // Voice mode state
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    // Selected appointment slot state
    const [selectedSlot, setSelectedSlot] = useState('5:30 PM');
    // Booking status state
    const [bookingStatus, setBookingStatus] = useState('confirmed');
    const [bookingDateTime, setBookingDateTime] = useState('Thu, Oct 29, 5:30 PM');
    const bookingId = 'SAT-2041';
    // Interactive dialog states
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [rescheduleSlot, setRescheduleSlot] = useState('6:15 PM');
    // Additional dynamic user messages
    const [additionalMessages, setAdditionalMessages] = useState([]);
    // Scroll to bottom when new message arrives
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [additionalMessages]);
    // Handle slot selection in the assistant's message
    const handleSelectSlot = async (slot) => {
        setSelectedSlot(slot);
        setBookingDateTime(`Thu, Oct 29, ${slot}`);
        try {
            await appointmentService.updateAppointment('apt-3', {
                time: slot,
                status: 'confirmed',
            });
        }
        catch (e) {
            console.warn('Could not update slot in appointmentService', e);
        }
        toast.info('Slot Selected', `You selected ${slot} for Dr. Sharma.`);
    };
    // Handle Send Text Message
    const handleSendMessage = (text) => {
        const timeNow = new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
        const userMsg = {
            id: `usr-${Date.now()}`,
            sender: 'user',
            content: text,
            timestamp: timeNow,
        };
        setAdditionalMessages((prev) => [...prev, userMsg]);
        // Simulated local intelligent assistant response
        setTimeout(() => {
            let reply = "Thank you, I have updated the clinic record. Dr. Sharma's clinic is here to assist with your healthcare needs.";
            const lower = text.toLowerCase();
            if (lower.includes('fee') || lower.includes('fees') || lower.includes('cost') || lower.includes('price')) {
                reply = "Dr. Sharma's consultation fee is ₹500. Follow-up visits within 7 days are complimentary.";
            }
            else if (lower.includes('time') || lower.includes('timing') || lower.includes('hours') || lower.includes('when') || lower.includes('open')) {
                reply = 'Clinic OPD consultation hours are 4:30 PM to 8:30 PM, Monday through Saturday.';
            }
            else if (lower.includes('thanks') || lower.includes('thank') || lower.includes('appreciate')) {
                reply = "You're welcome! Please take any prescribed medications on time and rest well.";
            }
            else if (lower.includes('medicine') || lower.includes('prescription') || lower.includes('rx')) {
                reply = 'Dr. Sharma will provide your digital prescription immediately following your consultation.';
            }
            const aiMsg = {
                id: `ai-${Date.now()}`,
                sender: 'assistant',
                content: reply,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            };
            setAdditionalMessages((prev) => [...prev, aiMsg]);
        }, 650);
    };
    // Handle Send Voice Note
    const handleSendVoiceNote = (seconds) => {
        const timeNow = new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
        const voiceMsg = {
            id: `vce-${Date.now()}`,
            sender: 'user',
            content: 'Voice note (Recorded)',
            timestamp: timeNow,
            type: 'voice',
            durationSeconds: seconds,
        };
        setAdditionalMessages((prev) => [...prev, voiceMsg]);
        toast.success('Voice Note Sent', `Audio note (${seconds}s) captured in demo mode.`);
    };
    // Cancel Booking Action
    const handleConfirmCancel = async () => {
        setBookingStatus('cancelled');
        setIsCancelModalOpen(false);
        try {
            await appointmentService.cancelAppointment('apt-3', 'Cancelled via Closr AI Receptionist');
        }
        catch (e) {
            console.warn('Could not cancel in appointmentService', e);
        }
        toast.error('Booking Cancelled', `Demo booking ${bookingId} has been cancelled.`);
    };
    // Reschedule Booking Action
    const handleConfirmReschedule = async () => {
        setSelectedSlot(rescheduleSlot);
        setBookingDateTime(`Thu, Oct 29, ${rescheduleSlot}`);
        setBookingStatus('rescheduled');
        setIsRescheduleModalOpen(false);
        try {
            await appointmentService.rescheduleAppointment('apt-3', '2026-10-29', rescheduleSlot);
        }
        catch (e) {
            console.warn('Could not reschedule in appointmentService', e);
        }
        toast.success('Appointment Rescheduled', `Dr. Sharma appointment moved to ${rescheduleSlot}.`);
    };
    return (<div className="min-h-screen bg-[#EDEBE2] text-closr-text flex flex-col items-center justify-start sm:p-4 select-none">
      {/* Mobile Shell Container: Phone preview on desktop, 100% on mobile */}
      <div className="w-full max-w-[420px] bg-closr-bg sm:border border-closr-border sm:rounded-[36px] shadow-2xl flex flex-col h-screen sm:h-[880px] sm:max-h-[94vh] overflow-hidden relative">
        
        {/* Top Status Bar (Cosmetic phone bar for realism) */}
        <div className="hidden sm:flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-closr-text-muted select-none">
          <span>4:32</span>
          <div className="w-20 h-4 bg-closr-border/60 rounded-full mx-auto"/>
          <span>5G • 100%</span>
        </div>

        {/* 1. Mobile Conversation Header */}
        <ReceptionistHeader isVoiceActive={isVoiceActive} onToggleVoice={() => {
            setIsVoiceActive((prev) => !prev);
            toast.info(isVoiceActive ? 'Voice Mode Disabled' : 'Voice Mode Active', 'Speech interface toggled.');
        }}/>

        {/* 2. Scrollable Conversation Area */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3.5 scroll-smooth">
          {/* Today Divider */}
          <div className="flex items-center justify-center my-1 select-none">
            <span className="text-[11px] font-medium text-closr-text-muted bg-closr-sage/40 px-3 py-0.5 rounded-full border border-closr-border/50">
              Today
            </span>
          </div>

          {/* Customer Message 1 */}
          <MessageBubble sender="user" content="I'd like to see Dr. Sharma tomorrow evening. I have a fever." timestamp="5:12 PM"/>

          {/* Assistant Response with Slot Picker */}
          <MessageBubble sender="assistant" content="Hello! Dr. Sharma has appointments available tomorrow (Thursday) for a fever consultation. Which time works best for you?" timestamp="5:12 PM">
            {/* Interactive Slot Buttons */}
            <AppointmentSlotPicker slots={['5:00 PM', '5:30 PM', '6:15 PM']} selectedSlot={selectedSlot} onSelectSlot={handleSelectSlot}/>
          </MessageBubble>

          {/* Calendar Check Status */}
          <div className="pl-8">
            <CalendarCheckStatus text="I've checked the clinic calendar"/>
          </div>

          {/* Audio Note Waveform Player */}
          <div className="pl-8">
            <VoiceNotePlayer durationSeconds={7}/>
          </div>

          {/* Customer Message 2 */}
          <MessageBubble sender="user" content={`${selectedSlot} works for me.`} timestamp="5:13 PM"/>

          {/* Booking Confirmation Card */}
          <div className="flex justify-center sm:justify-start sm:pl-8">
            <BookingConfirmationCard doctorName="Dr. Sharma" dateTime={bookingDateTime} bookingId={bookingId} status={bookingStatus} onCancel={() => setIsCancelModalOpen(true)} onReschedule={() => setIsRescheduleModalOpen(true)}/>
          </div>

          {/* Dynamically appended messages */}
          {additionalMessages.map((msg) => msg.type === 'voice' ? (<div key={msg.id} className="flex justify-end my-2">
                <div className="rounded-2xl rounded-tr-sm p-2.5 bg-[#D6E3D2] border border-closr-border">
                  <VoiceNotePlayer durationSeconds={msg.durationSeconds || 5}/>
                  <span className="block text-[10px] text-right text-closr-text-muted mt-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>) : (<MessageBubble key={msg.id} sender={msg.sender} content={msg.content} timestamp={msg.timestamp}/>))}

          <div ref={chatEndRef}/>
        </div>

        {/* 3. Sticky Bottom Message Composer */}
        <MessageComposer onSendMessage={handleSendMessage} onSendVoiceNote={handleSendVoiceNote} onAttachAction={(action) => {
            toast.info('Quick Attachment', `${action} selected in demo.`);
        }}/>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancel Demo Booking?" description={`Are you sure you want to cancel appointment ${bookingId}?`} footer={<>
            <Button variant="outline" size="sm" onClick={() => setIsCancelModalOpen(false)}>
              Keep booking
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmCancel}>
              Cancel booking
            </Button>
          </>}>
        <div className="p-3.5 rounded-xl bg-closr-bg border border-closr-border text-xs text-closr-text-muted space-y-1 text-left">
          <p className="font-semibold text-closr-text flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-closr-danger shrink-0"/>
            Local Demo Notice
          </p>
          <p>
            Cancelling this booking will update your local demo card state to cancelled. No real clinic schedule is modified.
          </p>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal isOpen={isRescheduleModalOpen} onClose={() => setIsRescheduleModalOpen(false)} title="Reschedule Dr. Sharma Slot" description="Select a new available time slot for your consultation" footer={<>
            <Button variant="outline" size="sm" onClick={() => setIsRescheduleModalOpen(false)}>
              Dismiss
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmReschedule}>
              Confirm Reschedule
            </Button>
          </>}>
        <div className="space-y-4 text-left">
          <div className="text-xs text-closr-text-muted">
            Choose from currently open clinic slots for Thursday, Oct 29:
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {['4:30 PM', '5:00 PM', '6:15 PM', '6:45 PM'].map((slot) => {
            const isChosen = rescheduleSlot === slot;
            return (<button key={slot} type="button" onClick={() => setRescheduleSlot(slot)} className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${isChosen
                    ? 'bg-closr-forest text-white border-closr-forest shadow-sm'
                    : 'bg-closr-card border-closr-border text-closr-text hover:bg-closr-sage/30'}`}>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5"/>
                    {slot}
                  </span>
                  <Calendar className="w-3.5 h-3.5 opacity-60"/>
                </button>);
        })}
          </div>
        </div>
      </Modal>
    </div>);
};
