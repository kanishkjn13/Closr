import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Square, Sparkles, FileText, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
export const MessageComposer = ({ onSendMessage, disabled = false, className, initialValue = '', }) => {
    const [text, setText] = useState(initialValue);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const textareaRef = useRef(null);
    const timerRef = useRef(null);
    useEffect(() => {
        if (initialValue) {
            setText(initialValue);
        }
    }, [initialValue]);
    // Handle voice recording simulation
    useEffect(() => {
        if (isRecording) {
            setRecordingSeconds(0);
            timerRef.current = setInterval(() => {
                setRecordingSeconds((prev) => prev + 1);
            }, 1000);
        }
        else {
            if (timerRef.current)
                clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current)
                clearInterval(timerRef.current);
        };
    }, [isRecording]);
    const handleSend = () => {
        const trimmed = text.trim();
        if (!trimmed || disabled)
            return;
        onSendMessage(trimmed, 'doctor', 'text');
        setText('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    const handleStopRecording = () => {
        setIsRecording(false);
        onSendMessage(`Voice note (${recordingSeconds || 4}s) · Clinic audio response`, 'doctor', 'voice');
    };
    const handleAttachDemoFile = (label) => {
        setShowAttachmentMenu(false);
        onSendMessage(`Attached document: ${label} (Demo PDF)`, 'doctor', 'text');
    };
    return (<div className={cn('p-3 bg-closr-card border-t border-closr-border select-none shrink-0 relative', className)}>
      {/* Attachment Popover */}
      {showAttachmentMenu && (<div className="absolute bottom-16 left-4 z-30 p-2 bg-white rounded-2xl border border-closr-border shadow-soft w-56 text-xs space-y-1 animate-fadeIn">
          <div className="px-2 py-1 text-[10px] font-semibold text-closr-text-muted uppercase tracking-wider">
            Add Attachment (Demo)
          </div>
          <button type="button" onClick={() => handleAttachDemoFile('Lab_Report_Routine_Blood.pdf')} className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-closr-sage/30 text-closr-text text-left transition-colors">
            <FileText className="w-3.5 h-3.5 text-closr-forest"/>
            <span>Lab Test Report</span>
          </button>
          <button type="button" onClick={() => handleAttachDemoFile('Prescription_DrSharma.pdf')} className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-closr-sage/30 text-closr-text text-left transition-colors">
            <FileText className="w-3.5 h-3.5 text-closr-forest"/>
            <span>Clinic Prescription</span>
          </button>
          <button type="button" onClick={() => handleAttachDemoFile('Clinic_OPD_Schedule.jpg')} className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-closr-sage/30 text-closr-text text-left transition-colors">
            <ImageIcon className="w-3.5 h-3.5 text-closr-forest"/>
            <span>OPD Schedule Flyer</span>
          </button>
        </div>)}

      {/* Voice Recording Mode */}
      {isRecording ? (<div className="flex items-center justify-between p-2.5 rounded-2xl bg-closr-danger-bg/80 border border-closr-danger/30 text-closr-danger animate-pulse">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-closr-danger animate-ping"/>
            <span>Recording voice note... 0:0{recordingSeconds}</span>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIsRecording(false)} className="px-2.5 py-1 rounded-xl text-xs font-medium text-closr-text hover:bg-black/5">
              Cancel
            </button>
            <button type="button" onClick={handleStopRecording} className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-closr-danger text-white text-xs font-semibold hover:bg-closr-danger/90 shadow-soft">
              <Square className="w-3 h-3 fill-current"/>
              <span>Send Audio</span>
            </button>
          </div>
        </div>) : (
        /* Normal Input Mode */
        <div className="flex items-end gap-2 bg-[#F6F4EC] p-1.5 rounded-2xl border border-closr-border focus-within:border-closr-forest focus-within:ring-2 focus-within:ring-closr-forest/10 transition-all">
          {/* Attachment button */}
          <button type="button" onClick={() => setShowAttachmentMenu(!showAttachmentMenu)} aria-label="Add attachment" className="p-2 text-closr-text-muted hover:text-closr-forest hover:bg-closr-sage/40 rounded-xl transition-colors closr-focus shrink-0">
            <Paperclip className="w-4 h-4"/>
          </button>

          {/* Multiline textarea */}
          <textarea ref={textareaRef} rows={1} value={text} onChange={(e) => {
                setText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }} onKeyDown={handleKeyDown} placeholder="Type a message or record a voice note..." disabled={disabled} className="flex-1 max-h-28 bg-transparent text-sm text-closr-text placeholder:text-closr-text-muted/70 focus:outline-hidden resize-none py-1.5 px-1 leading-relaxed"/>

          {/* Voice note record button */}
          <button type="button" onClick={() => setIsRecording(true)} aria-label="Record voice note" className="p-2 text-closr-text-muted hover:text-closr-forest hover:bg-closr-sage/40 rounded-xl transition-colors closr-focus shrink-0">
            <Mic className="w-4 h-4"/>
          </button>

          {/* Send button */}
          <button type="button" onClick={handleSend} disabled={!text.trim() || disabled} aria-label="Send message" className={cn('p-2 rounded-xl transition-all closr-focus shrink-0', text.trim() && !disabled
                ? 'bg-closr-forest text-white hover:bg-closr-forest-hover shadow-soft'
                : 'bg-closr-border/70 text-closr-text-muted cursor-not-allowed opacity-60')}>
            <Send className="w-4 h-4"/>
          </button>
        </div>)}

      {/* Footer note: Predefined demo simulation disclaimer */}
      <div className="flex items-center justify-between text-[10px] text-closr-text-muted px-2 pt-2">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-closr-forest"/>
          Predefined assistant responses active
        </span>
        <span className="hidden sm:inline">Press Enter to send · Shift+Enter for newline</span>
      </div>
    </div>);
};
