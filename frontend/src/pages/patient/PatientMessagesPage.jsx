import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  Paperclip, 
  ShieldAlert, 
  ArrowLeft, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Check, 
  CheckCheck,
  Stethoscope,
  Info
} from 'lucide-react';
import { usePatientAuth } from '../../context/PatientAuthContext';
import { useAuth } from '../../context/AuthContext';
import { conversationService } from '../../services/conversationService';
import { appointmentService } from '../../services/appointmentService';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../lib/utils';

export const PatientMessagesPage = () => {
  const { currentPatient } = usePatientAuth();
  const { user: authUser } = useAuth();
  const activePatient = currentPatient || (authUser?.role === 'patient' ? authUser : null);
  const toast = useToast();
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [patientAppointment, setPatientAppointment] = useState(null);

  // Load conversations for this patient
  const loadConversations = useCallback(async () => {
    if (!activePatient?.id) return;
    try {
      const allConvs = await conversationService.getConversations();
      const patientConvs = allConvs.filter((c) => c.patientId === activePatient.id);
      setConversations(patientConvs);

      if (patientConvs.length > 0) {
        setSelectedConvId((prev) => prev || patientConvs[0].id);
      }
    } catch (err) {
      console.warn('Failed to load patient conversations', err);
    }
  }, [activePatient?.id]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages whenever selected conversation changes
  const loadMessages = useCallback(async (convId) => {
    if (!convId) return;
    setIsLoadingMessages(true);
    try {
      const msgs = await conversationService.getMessagesByConversationId(convId);
      setMessages(msgs);
      await conversationService.markAsRead(convId);

      // Load matching appointment if any
      const conv = conversations.find((c) => c.id === convId);
      if (conv?.bookingId && activePatient?.id) {
        const apts = await appointmentService.getAppointmentsByPatientId(activePatient.id);
        const match = apts.find((a) => a.bookingCode === conv.bookingId);
        setPatientAppointment(match || null);
      }
    } catch (err) {
      console.warn('Error fetching messages', err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [conversations, activePatient?.id]);

  useEffect(() => {
    if (selectedConvId) {
      loadMessages(selectedConvId);
    }
  }, [selectedConvId, loadMessages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConv = (id) => {
    setSelectedConvId(id);
    setShowMobileChat(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConvId) return;

    const text = inputText.trim();
    setInputText('');

    try {
      // Send as patient (user)
      const userMsg = await conversationService.sendMessage(
        selectedConvId,
        text,
        'user',
        'text'
      );
      setMessages((prev) => [...prev, userMsg]);

      // Update snippet
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConvId
            ? { ...c, lastMessage: text, lastMessageTimestamp: userMsg.timestamp }
            : c
        )
      );

      // Automated receptionist / clinic assistant reply simulation
      const lower = text.toLowerCase();
      setTimeout(async () => {
        let reply = "Thank you for reaching out to Dr. Sharma's Clinic. Our triage desk has received your message and will review it shortly.";
        let replyType = 'text';

        if (lower.includes('fee') || lower.includes('cost') || lower.includes('price')) {
          reply = "Dr. Sharma's consultation fee is ₹600. Follow-up visits within 7 days are complimentary.";
        } else if (lower.includes('timing') || lower.includes('hours') || lower.includes('open')) {
          reply = "Clinic OPD consultation hours are 9:00 AM - 1:00 PM and 5:00 PM - 8:30 PM, Monday through Saturday.";
        } else if (lower.includes('chest') || lower.includes('breath') || lower.includes('emergency')) {
          reply = "⚠️ URGENT NOTICE: If you are experiencing chest discomfort, breathlessness, or severe distress, please call emergency services (108/911) or visit the nearest emergency room immediately.";
        } else if (lower.includes('thank') || lower.includes('thanks')) {
          reply = "You're welcome! Please rest well, and feel free to reach out if you have any questions before your visit.";
        }

        const aiMsg = await conversationService.sendMessage(
          selectedConvId,
          reply,
          'assistant',
          replyType
        );
        setMessages((prev) => [...prev, aiMsg]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConvId
              ? { ...c, lastMessage: reply, lastMessageTimestamp: aiMsg.timestamp }
              : c
          )
        );
      }, 700);
    } catch (err) {
      toast.error('Failed to send message', err.message);
    }
  };

  const selectedConversation = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  return (
    <div className="space-y-4 text-left">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-closr-text tracking-tight">
            Messages & Clinic Support
          </h1>
          <p className="text-xs sm:text-sm text-closr-text-muted mt-0.5">
            Direct communication channel with Dr. Sharma's clinic reception and AI assistant.
          </p>
        </div>
      </div>

      {/* 2. Main 3-Column / 2-Column Responsive Workspace */}
      <div className="bg-closr-card rounded-3xl border border-closr-border shadow-soft overflow-hidden h-[700px] max-h-[82vh] flex relative">
        
        {/* Left Column: Conversation list */}
        <div
          className={cn(
            'w-full md:w-80 shrink-0 border-r border-closr-border flex flex-col bg-closr-bg/40',
            showMobileChat ? 'hidden md:flex' : 'flex'
          )}
        >
          <div className="p-4 border-b border-closr-border bg-closr-card flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-closr-text">
              Conversations
            </h3>
            <Badge variant="confirmed" size="sm">
              {conversations.length} Active
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-closr-border/60">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-closr-text-muted">
                No active conversations for your account.
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConv(conv.id)}
                    className={cn(
                      'p-4 cursor-pointer transition-all text-left space-y-1',
                      isSelected
                        ? 'bg-closr-sage/40 border-l-4 border-closr-forest'
                        : 'hover:bg-closr-bg/80'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-closr-text">
                        Clinic Reception & AI
                      </p>
                      <span className="text-[10px] text-closr-text-muted">
                        {conv.lastMessageTimestamp || 'Recent'}
                      </span>
                    </div>
                    <p className="text-[11px] text-closr-text-muted line-clamp-2">
                      {conv.lastMessage || 'Start conversation...'}
                    </p>
                    {conv.bookingId && (
                      <span className="inline-block text-[9px] font-mono font-semibold text-closr-forest bg-white px-1.5 py-0.5 rounded border border-closr-border/80">
                        Ref: {conv.bookingId}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Active Conversation */}
        <div
          className={cn(
            'flex-1 flex flex-col min-w-0 bg-closr-card',
            !showMobileChat ? 'hidden md:flex' : 'flex'
          )}
        >
          {/* Thread Header */}
          <div className="px-5 py-3.5 border-b border-closr-border flex items-center justify-between shrink-0 bg-closr-card">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowMobileChat(false)}
                className="md:hidden p-1.5 rounded-lg hover:bg-closr-sage/40 text-closr-text"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-8 h-8 rounded-full bg-closr-forest text-white flex items-center justify-center font-bold text-xs">
                DS
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-closr-text">
                  Dr. Sharma's Clinic Reception
                </h3>
                <span className="text-[10px] text-closr-success font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-closr-success animate-pulse" />
                  Online · AI Assistant & Staff Triage Desk
                </span>
              </div>
            </div>

            {selectedConversation?.bookingId && (
              <Badge variant="confirmed" size="sm">
                Visit: {selectedConversation.bookingId}
              </Badge>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-closr-bg/20">
            {/* Conversation Safety Banner */}
            <div className="p-3 rounded-2xl bg-[#F0EFEB] border border-closr-border text-[11px] text-closr-text-muted flex items-start gap-2 select-none">
              <ShieldAlert className="w-4 h-4 text-closr-amber shrink-0 mt-0.5" />
              <span>
                <strong>Routine Triage Channel:</strong> For acute medical emergencies or severe distress, call <strong>108 / 911</strong> immediately. Messages here are monitored by clinic staff during OPD hours.
              </span>
            </div>

            {isLoadingMessages ? (
              <div className="py-12 text-center text-xs text-closr-text-muted">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="py-16 text-center text-xs text-closr-text-muted">
                No messages yet. Send a note to clinic staff below.
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 sm:p-3.5 text-xs shadow-xs',
                        isUser
                          ? 'bg-closr-forest text-white rounded-br-xs'
                          : 'bg-white text-closr-text border border-closr-border rounded-bl-xs'
                      )}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      
                      {/* Optional metadata slot suggestion */}
                      {msg.metadata?.suggestedSlots && (
                        <div className="mt-2.5 pt-2 border-t border-closr-border/40 grid grid-cols-3 gap-1.5">
                          {msg.metadata.suggestedSlots.map((slot) => (
                            <span
                              key={slot}
                              className="px-2 py-1 text-center bg-closr-sage/50 text-closr-forest font-semibold rounded text-[10px]"
                            >
                              {slot}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-closr-text-muted mt-1 px-1">
                      {msg.timestamp || 'Just now'}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sticky Bottom Composer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-closr-border bg-closr-card flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Type your message to clinic reception..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-closr-border bg-white text-xs text-closr-text closr-focus shadow-2xs"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!inputText.trim()}
              className="px-4 py-2.5 rounded-xl shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Right Column (Desktop Only): Appointment Context & Emergency Warning */}
        <div className="hidden lg:flex w-72 shrink-0 border-l border-closr-border p-5 flex-col justify-between bg-closr-card text-left space-y-4">
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-sm text-closr-text">
              Visit Details
            </h4>

            {patientAppointment ? (
              <div className="p-3.5 rounded-2xl bg-closr-bg border border-closr-border text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-closr-text-muted text-[11px]">Doctor</span>
                  <span className="font-semibold text-closr-text">{patientAppointment.doctorName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-closr-text-muted text-[11px]">Date & Time</span>
                  <span className="font-semibold text-closr-text">{patientAppointment.date} · {patientAppointment.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-closr-text-muted text-[11px]">Service</span>
                  <span className="font-semibold text-closr-text">{patientAppointment.service}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-closr-border/60">
                  <span className="text-closr-text-muted text-[11px]">Status</span>
                  <Badge variant={patientAppointment.status}>
                    {patientAppointment.status}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-closr-bg/50 border border-closr-border text-xs text-closr-text-muted text-center">
                General clinic consultation channel.
              </div>
            )}

            <div className="p-3 rounded-2xl bg-white border border-closr-border space-y-2 text-xs">
              <span className="font-semibold text-closr-text block">Clinic Hours:</span>
              <p className="text-[11px] text-closr-text-muted leading-relaxed">
                Mon - Sat: 9:00 AM - 1:00 PM &amp; 5:00 PM - 8:30 PM.
              </p>
              <p className="text-[11px] text-closr-text-muted">
                Replies are managed by Closr AI and clinic receptionists.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-closr-danger-bg/50 border border-closr-danger/20 text-[10px] text-closr-danger space-y-1">
            <span className="font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> Emergency Disclaimer
            </span>
            <p>
              Do not use chat for severe symptoms, chest pain, or trauma. Call 108 or 911 immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
