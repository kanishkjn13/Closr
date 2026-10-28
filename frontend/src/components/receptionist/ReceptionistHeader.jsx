import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AudioLines } from 'lucide-react';
import { cn } from '../../lib/utils';
export const ReceptionistHeader = ({ isVoiceActive = false, onToggleVoice, onBack, className, }) => {
    const navigate = useNavigate();
    const handleBack = () => {
        if (onBack) {
            onBack();
        }
        else if (window.history.length > 1) {
            navigate(-1);
        }
        else {
            navigate('/');
        }
    };
    return (<header className={cn('sticky top-0 z-30 flex items-center justify-between px-3.5 py-2.5 bg-closr-bg/95 backdrop-blur-md border-b border-closr-border/80 select-none', className)}>
      {/* Left: Back button & Closr Identity */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={handleBack} aria-label="Back to dashboard" className="p-1 -ml-1 text-closr-forest hover:bg-closr-sage/50 rounded-full transition-colors closr-focus active:scale-95">
          <ChevronLeft className="w-6 h-6 stroke-[2.2]"/>
        </button>

        {/* Closr Brand & Status */}
        <div className="flex items-center gap-2">
          {/* Leaf Icon matching screenshot */}
          <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-closr-forest">
              <path d="M6 26C6 26 8 16 16 10C24 4 28 6 28 6C28 6 27 15 20 22C13 29 6 26 6 26Z" fill="#174F43"/>
              <path d="M10 23C13 19 18 15 24 11" stroke="#E2E9DF" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 17C17.5 19 19 20.5 21 21.5" stroke="#E2E9DF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-serif text-lg font-bold tracking-tight text-closr-forest">
                Closr
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-closr-text-muted mt-0.5">
              <span>AI receptionist</span>
              <span className="text-[9px] opacity-60">•</span>
              <span className="inline-flex items-center gap-1 text-closr-success font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-closr-success animate-pulse"/>
                online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Circular voice control button matching reference */}
      <button type="button" onClick={onToggleVoice} aria-label={isVoiceActive ? 'Voice assistant active' : 'Enable voice interaction'} className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 closr-focus active:scale-95', isVoiceActive
            ? 'bg-closr-forest text-white ring-2 ring-closr-forest/30 shadow-soft'
            : 'bg-closr-card border border-closr-border text-closr-forest hover:bg-closr-sage/40')}>
        <AudioLines className="w-4 h-4 stroke-[2]"/>
      </button>
    </header>);
};
