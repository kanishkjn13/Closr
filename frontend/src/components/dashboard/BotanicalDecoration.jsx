import React from 'react';
import { cn } from '../../lib/utils';
export const BotanicalHeaderMotif = ({ className }) => {
    return (<div className={cn('absolute -top-4 -right-2 pointer-events-none select-none z-0 overflow-hidden', className)} aria-hidden="true">
      <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
        {/* Soft sage curved leaf backdrop */}
        <path d="M220 20C170 30 110 80 100 150C90 200 120 220 150 220C190 200 215 130 220 20Z" fill="#D6E2D0" fillOpacity="0.75"/>
        {/* Dark forest green accent leaf overlay */}
        <path d="M220 60C190 70 140 105 135 160C130 195 150 210 170 210C195 185 210 135 220 60Z" fill="#174F43" fillOpacity="0.85"/>
        {/* Delicate leaf stem & veins */}
        <path d="M220 30C180 50 140 110 120 190" stroke="#E6E4DA" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M165 95C150 115 145 135 142 165" stroke="#FAF9F4" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6"/>
      </svg>
    </div>);
};
export const BotanicalFooterSignature = ({ className }) => {
    return (<div className={cn('flex items-center justify-end select-none pointer-events-none mt-2 text-right', className)} aria-hidden="true">
      <span className="font-serif italic text-xs tracking-wide text-closr-forest/50">
        Better care closer
      </span>
    </div>);
};
