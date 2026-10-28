import React, { useState } from 'react';
import { Plus, Mic, Send } from 'lucide-react';
import { AttachmentMenu } from './AttachmentMenu';
import { RecordingIndicator } from './RecordingIndicator';
import { cn } from '../../lib/utils';
export const MessageComposer = ({ onSendMessage, onSendVoiceNote, onAttachAction, className, }) => {
    const [inputText, setInputText] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const handleSend = () => {
        const trimmed = inputText.trim();
        if (!trimmed)
            return;
        onSendMessage(trimmed);
        setInputText('');
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    const hasText = inputText.trim().length > 0;
    return (<div className={cn('sticky bottom-0 left-0 right-0 z-30 p-2.5 sm:p-3 bg-closr-bg/95 backdrop-blur-md border-t border-closr-border/80 select-none', className)}>
      <div className="relative max-w-md mx-auto flex items-center gap-2">
        {/* Attachment menu floating above plus button */}
        <AttachmentMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onSelectAction={onAttachAction}/>

        {isRecording ? (<RecordingIndicator onStop={(duration) => {
                setIsRecording(false);
                onSendVoiceNote(duration);
            }} onCancel={() => setIsRecording(false)}/>) : (<>
            {/* 1. Circular Plus Button */}
            <button type="button" aria-label="Add attachment" onClick={() => setIsMenuOpen((prev) => !prev)} className="w-9 h-9 rounded-full bg-closr-forest text-white flex items-center justify-center shrink-0 hover:bg-closr-forest-hover transition-transform active:scale-95 closr-focus shadow-soft">
              <Plus className="w-5 h-5 stroke-[2.2]"/>
            </button>

            {/* 2. Rounded Pill Text Input */}
            <div className="flex-1 relative flex items-center">
              <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown} placeholder="Message ya voice note..." className="w-full h-10 px-4 text-xs sm:text-[13px] rounded-full bg-closr-card border border-closr-border text-closr-text placeholder:text-closr-text-muted/70 focus:outline-none focus:border-closr-forest focus:ring-1 focus:ring-closr-forest/20 transition-all shadow-xs"/>
            </div>

            {/* 3. Send or Microphone Button */}
            {hasText ? (<button type="button" aria-label="Send message" onClick={handleSend} className="w-9 h-9 rounded-full bg-closr-forest text-white flex items-center justify-center shrink-0 hover:bg-closr-forest-hover transition-transform active:scale-95 closr-focus shadow-soft">
                <Send className="w-4 h-4 ml-0.5 stroke-[2]"/>
              </button>) : (<button type="button" aria-label="Record voice note" onClick={() => setIsRecording(true)} className="w-9 h-9 rounded-full bg-closr-forest text-white flex items-center justify-center shrink-0 hover:bg-closr-forest-hover transition-transform active:scale-95 closr-focus shadow-soft">
                <Mic className="w-4 h-4 stroke-[2]"/>
              </button>)}
          </>)}
      </div>
    </div>);
};
