import React from 'react';
import { CheckCheck } from 'lucide-react';
import { cn } from '../../lib/utils';
export const MessageBubble = ({ sender, content, timestamp, className, children, }) => {
    const isUser = sender === 'user';
    if (isUser) {
        return (<div className={cn('flex justify-end my-2 select-text', className)}>
        <div className="max-w-[82%] sm:max-w-[76%] rounded-2xl rounded-tr-sm px-4 py-2.5 bg-[#D6E3D2] text-closr-text shadow-xs text-left">
          <p className="text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-closr-text-muted select-none">
            <span>{timestamp}</span>
            <CheckCheck className="w-3.5 h-3.5 text-closr-forest stroke-[2.2]"/>
          </div>
        </div>
      </div>);
    }
    // Assistant message
    return (<div className={cn('flex items-start gap-2 my-2.5 select-text text-left', className)}>
      {/* Assistant Leaf Emblem */}
      <div className="w-6 h-6 rounded-md bg-closr-forest flex items-center justify-center shrink-0 mt-1 shadow-xs">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white">
          <path d="M6 26C6 26 8 16 16 10C24 4 28 6 28 6C28 6 27 15 20 22C13 29 6 26 6 26Z" fill="currentColor"/>
          <path d="M10 23C13 19 18 15 24 11" stroke="#E2E9DF" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Bubble Content */}
      <div className="max-w-[85%] sm:max-w-[80%] space-y-1.5">
        <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-closr-card border border-closr-border text-closr-text shadow-xs">
          <span className="block text-[11px] font-semibold text-closr-forest mb-1">
            Closr
          </span>
          <p className="text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
          {children}
        </div>
      </div>
    </div>);
};
