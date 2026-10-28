import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { ConversationAppointmentCard } from './ConversationAppointmentCard';
import { ShieldAlert, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
export const ConversationThread = ({ conversation, messages, appointment, onViewAppointment, onRescheduleAppointment, onCancelAppointment, onSelectSlot, isLoading = false, className, }) => {
    const bottomRef = useRef(null);
    // Auto scroll to bottom when messages change or conversation switches
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, conversation.id]);
    const isEmergency = conversation.category === 'emergency' || conversation.status === 'escalated';
    return (<div className={cn('flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F6F4EC]/60 select-text', className)}>
      {/* Date Separator */}
      <div className="flex justify-center select-none pt-1">
        <span className="px-3 py-1 rounded-full text-[11px] font-medium text-closr-text-muted bg-closr-card/90 border border-closr-border/60 shadow-2xs">
          Today · 29 October 2026
        </span>
      </div>

      {/* Emergency / Safety Triage Banner for Acute Symptoms */}
      {isEmergency && (<div className="p-3.5 rounded-2xl bg-closr-danger-bg/90 border border-closr-danger/30 text-closr-danger shadow-soft flex items-start gap-2.5 text-left my-2 animate-fadeIn">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5"/>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase tracking-wider text-[10px] bg-closr-danger text-white px-2 py-0.5 rounded-md">
                Urgent Clinical Triage
              </span>
              <span className="font-semibold text-closr-danger">
                Emergency escalation active
              </span>
            </div>
            <p className="text-closr-text leading-relaxed">
              Patient reported acute symptoms (chest discomfort / respiratory difficulty). Saathi
              safety protocol advised immediate 108 emergency contact. Human triage desk notified.
            </p>
          </div>
        </div>)}

      {/* Loading state */}
      {isLoading ? (<div className="py-12 flex flex-col items-center justify-center text-closr-text-muted gap-2 text-xs">
          <div className="w-5 h-5 border-2 border-closr-forest border-t-transparent rounded-full animate-spin"/>
          <span>Loading message history...</span>
        </div>) : messages.length === 0 ? (<div className="py-16 text-center text-closr-text-muted space-y-2">
          <div className="w-10 h-10 rounded-full bg-closr-sage/40 flex items-center justify-center mx-auto text-closr-forest">
            <MessageSquare className="w-5 h-5"/>
          </div>
          <p className="text-xs font-medium">No messages in this conversation yet.</p>
          <p className="text-[11px]">Send a reply below to start chatting.</p>
        </div>) : (<div className="space-y-2.5">
          {messages.map((message) => {
                const isBookingCard = message.type === 'card' ||
                    message.metadata?.bookingId ||
                    (conversation.bookingId &&
                        appointment &&
                        message.content.toLowerCase().includes('booking confirm'));
                return (<React.Fragment key={message.id}>
                <MessageBubble message={message} onSelectSlot={onSelectSlot}/>

                {/* Embedded appointment card if message is a booking card */}
                {isBookingCard && appointment && (<div className="flex justify-start my-2 pl-8">
                    <ConversationAppointmentCard appointment={appointment} onViewAppointment={onViewAppointment} onReschedule={onRescheduleAppointment} onCancel={onCancelAppointment}/>
                  </div>)}
              </React.Fragment>);
            })}
        </div>)}

      {/* Bottom anchor for scrolling */}
      <div ref={bottomRef} className="h-2"/>
    </div>);
};
