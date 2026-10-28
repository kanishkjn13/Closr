import React, { useState, useEffect } from 'react';
import { Square } from 'lucide-react';
import { cn } from '../../lib/utils';
export const RecordingIndicator = ({ onStop, onCancel, className, }) => {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const timer = window.setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    const formatSeconds = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };
    return (<div className={cn('flex items-center justify-between w-full px-3 py-2 bg-closr-forest text-white rounded-full shadow-soft animate-in fade-in duration-150', className)}>
      {/* Live recording indicator & timer */}
      <div className="flex items-center gap-2 pl-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0"/>
        <span className="text-xs font-mono font-medium tracking-wide">
          Rec {formatSeconds(seconds)}
        </span>
        <span className="text-[11px] text-white/70 italic hidden sm:inline">
          (Simulated voice note)
        </span>
      </div>

      {/* Stop & Cancel controls */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={onCancel} className="text-xs text-white/80 hover:text-white px-2 py-1 rounded-md transition-colors">
          Cancel
        </button>
        <button type="button" onClick={() => onStop(seconds || 3)} className="flex items-center gap-1.5 px-3 py-1 bg-white text-closr-forest text-xs font-semibold rounded-full hover:bg-closr-pale transition-colors shadow-xs">
          <Square className="w-3 h-3 fill-current"/>
          <span>Send</span>
        </button>
      </div>
    </div>);
};
