import React from 'react';
import { Bell, Clock } from 'lucide-react';
import { BotanicalFooterSignature } from './BotanicalDecoration';
export const UpcomingRemindersCard = ({ onOpenReminderModal, }) => {
    return (<div className="space-y-3">
      <div className="bg-closr-card border border-closr-border rounded-2xl shadow-card p-5 sm:p-6 text-left">
        {/* Title with small bell icon matching screenshot */}
        <h2 className="text-sm sm:text-base font-medium text-closr-text tracking-tight mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-closr-forest stroke-[2]"/>
          <span>Upcoming reminders</span>
        </h2>

        {/* Softly bordered inner panel with pale background */}
        <div role="button" tabIndex={0} onClick={onOpenReminderModal} onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenReminderModal();
            }
        }} className="p-3.5 sm:p-4 rounded-xl border border-closr-border/80 bg-closr-bg/40 hover:bg-closr-sage/30 hover:border-closr-border-dark cursor-pointer transition-all duration-150 closr-focus space-y-1.5">
          <div className="flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-closr-text">
            <Clock className="w-3.5 h-3.5 text-closr-forest"/>
            <span>3:30 PM</span>
          </div>

          <div className="text-xs text-closr-text">
            Reminder — Dr. Sharma
          </div>

          <div className="text-[11px] text-closr-text-muted">
            SAT-2041 · Rohit V.
          </div>
        </div>
      </div>

      {/* Subtle signature at bottom right matching reference screenshot */}
      <BotanicalFooterSignature />
    </div>);
};
