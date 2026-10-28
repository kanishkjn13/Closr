import React from 'react';
import { Menu } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { BotanicalHeaderMotif } from './BotanicalDecoration';
export const DashboardHeader = ({ onOpenMobileMenu, date = 'Thu, Oct 29, 2026', doctorName = 'Dr. Sharma', }) => {
    return (<div className="relative mb-6 sm:mb-8">
      {/* Decorative leaf motif positioned neatly in the top right background */}
      <BotanicalHeaderMotif className="hidden sm:block"/>

      {/* Top bar with mobile hamburger and date/profile avatar */}
      <div className="flex items-center justify-between relative z-10 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          {onOpenMobileMenu && (<button onClick={onOpenMobileMenu} aria-label="Open sidebar menu" className="lg:hidden p-1.5 rounded-xl text-closr-forest hover:bg-closr-sage/60 transition-colors closr-focus">
              <Menu className="w-5 h-5"/>
            </button>)}
        </div>

        {/* Top-right date and profile avatar */}
        <div className="flex items-center gap-3 select-none">
          <span className="text-xs sm:text-[13px] font-medium text-closr-text-muted">
            {date}
          </span>
          <Avatar name={doctorName} size="sm" className="ring-2 ring-closr-border bg-closr-sage text-closr-forest shadow-xs"/>
        </div>
      </div>

      {/* Greeting block matching reference screenshot */}
      <div className="relative z-10 space-y-1 text-left max-w-2xl">
        <p className="text-xs sm:text-sm font-medium text-closr-text-muted">
          Good afternoon,
        </p>
        <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-serif font-medium text-closr-forest tracking-tight leading-tight">
          Here’s what’s happening today.
        </h1>
        <p className="text-xs sm:text-sm text-closr-text-muted pt-0.5">
          Smarter conversations. Healthier tomorrows.
        </p>
      </div>
    </div>);
};
