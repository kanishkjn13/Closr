import React, { useState } from 'react';
import { Sparkles, Calendar, Volume2, Play, Pause, CheckCheck, Clock, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';
export const MessageBubble = ({ message, onSelectSlot, className, }) => {
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const isUser = message.sender === 'user';
    const isAssistant = message.sender === 'assistant';
    const isDoctor = message.sender === 'doctor';
    const isSystem = message.sender === 'system';
    // System Event Message (Centered pill)
    if (isSystem) {
        const isUrgent = message.content.includes('URGENT') || message.content.includes('ESCALATION');
        return (<div className={cn('flex justify-center my-2.5 px-4', className)}>
        <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border shadow-2xs text-center max-w-md', isUrgent
                ? 'bg-closr-danger-bg text-closr-danger border-closr-danger/30 font-semibold'
                : 'bg-[#EDEBE3] text-closr-text-muted border-closr-border')}>
          {isUrgent ? (<ShieldAlert className="w-3.5 h-3.5 shrink-0 text-closr-danger"/>) : (<Calendar className="w-3.5 h-3.5 shrink-0 text-closr-forest"/>)}
          <span>{message.content}</span>
        </div>
      </div>);
    }
    // Voice Note Message
    if (message.type === 'voice') {
        const duration = message.metadata?.durationSeconds || 6;
        return (<div className={cn('flex gap-2.5 my-2 max-w-[85%] md:max-w-[70%]', isUser ? 'ml-auto justify-end' : 'mr-auto justify-start', className)}>
        {!isUser && (<div className="w-6 h-6 rounded-full bg-closr-forest text-white flex items-center justify-center shrink-0 text-[10px] mt-1 shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#BDE3C3]"/>
          </div>)}

        <div className={cn('px-3.5 py-2.5 rounded-2xl border shadow-soft select-none text-left min-w-[220px]', isUser
                ? 'bg-[#E2E9DF] border-[#D0DEC9] rounded-tr-sm text-closr-text'
                : 'bg-white border-closr-border rounded-tl-sm text-closr-text')}>
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={() => setIsPlayingAudio(!isPlayingAudio)} aria-label={isPlayingAudio ? 'Pause voice message' : 'Play voice message'} className="w-7 h-7 rounded-full bg-closr-forest text-white flex items-center justify-center hover:bg-closr-forest-hover transition-colors shadow-2xs shrink-0">
              {isPlayingAudio ? (<Pause className="w-3 h-3 fill-current"/>) : (<Play className="w-3 h-3 fill-current ml-0.5"/>)}
            </button>

            {/* Simulated Audio Waveform */}
            <div className="flex-1 flex items-center gap-0.5 h-5 px-1">
              {[40, 65, 85, 45, 95, 70, 50, 80, 60, 40, 90, 75, 45, 30].map((h, i) => (<div key={i} className={cn('w-1 rounded-full transition-all duration-300', isPlayingAudio ? 'bg-closr-forest animate-pulse' : 'bg-closr-forest/40')} style={{ height: `${h}%` }}/>))}
            </div>

            <div className="text-[10px] text-closr-text-muted font-mono flex items-center gap-1 shrink-0">
              <Volume2 className="w-3 h-3 text-closr-forest"/>
              <span>0:0{duration}</span>
            </div>
          </div>

          <p className="text-[11px] text-closr-text-muted italic mt-1.5 pl-0.5">
            "{message.content}"
          </p>

          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-closr-text-muted">
            <span>{message.timestamp}</span>
            {isUser && <CheckCheck className="w-3 h-3 text-closr-forest"/>}
          </div>
        </div>
      </div>);
    }
    // Standard Text Message / Quick Reply
    return (<div className={cn('flex gap-2.5 my-1.5 max-w-[85%] md:max-w-[72%]', isUser || isDoctor ? 'ml-auto justify-end' : 'mr-auto justify-start', className)}>
      {/* Assistant Avatar */}
      {isAssistant && (<div className="w-6 h-6 rounded-full bg-closr-forest text-white flex items-center justify-center shrink-0 text-[10px] mt-1 shadow-2xs">
          <Sparkles className="w-3 h-3 text-[#BDE3C3]"/>
        </div>)}

      <div className="space-y-1.5 text-left">
        {/* Doctor / Staff label */}
        {isDoctor && (<div className="flex items-center justify-end gap-1 text-[10px] text-closr-forest font-semibold pr-1">
            <span>Clinic Staff</span>
          </div>)}

        <div className={cn('px-3.5 py-2.5 rounded-2xl border shadow-soft select-text text-sm leading-relaxed', isUser
            ? 'bg-[#E2E9DF] border-[#D0DEC9] rounded-tr-sm text-closr-text'
            : isDoctor
                ? 'bg-[#EBF3EB] border-[#CFE0CF] rounded-tr-sm text-closr-text'
                : 'bg-[#FCFBF6] border-closr-border rounded-tl-sm text-closr-text')}>
          <div className="whitespace-pre-wrap">{message.content}</div>

          {/* Quick Reply Slot Chips */}
          {message.metadata?.suggestedSlots && message.metadata.suggestedSlots.length > 0 && (<div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-closr-border/60">
              <span className="text-[10px] text-closr-text-muted font-medium mr-1 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5"/> Slots:
              </span>
              {message.metadata.suggestedSlots.map((slot) => (<button key={slot} type="button" onClick={() => onSelectSlot?.(slot)} className="px-2 py-0.5 rounded-lg bg-closr-sage/60 hover:bg-closr-forest hover:text-white border border-closr-border/80 text-closr-text font-semibold text-[11px] transition-colors">
                  {slot}
                </button>))}
            </div>)}

          <div className={cn('flex items-center gap-1 mt-1.5 text-[10px]', isUser || isDoctor
            ? 'justify-end text-closr-text-muted'
            : 'justify-start text-closr-text-muted/80')}>
            <span>{message.timestamp}</span>
            {isUser && <CheckCheck className="w-3 h-3 text-closr-forest"/>}
          </div>
        </div>
      </div>
    </div>);
};
