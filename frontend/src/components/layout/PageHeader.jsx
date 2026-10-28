import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../lib/utils';
import { notificationService } from '../../services/notificationService';
export const PageHeader = ({ title, subtitle, onOpenMobileMenu, actions, children, className, }) => {
    const [unreadCount, setUnreadCount] = useState(() => notificationService.getUnreadCount());
    useEffect(() => {
        return notificationService.subscribe(() => {
            setUnreadCount(notificationService.getUnreadCount());
        });
    }, []);
    return (<header className={cn('flex flex-col gap-4 mb-6 sm:mb-8 select-none', className)}>
      <div className="flex items-center justify-between gap-4">
        {/* Mobile Menu Toggle & Title */}
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (<button onClick={onOpenMobileMenu} aria-label="Open navigation menu" className="lg:hidden p-2 rounded-xl text-closr-forest hover:bg-closr-sage/60 transition-colors closr-focus">
              <Menu className="w-5 h-5"/>
            </button>)}

          {title && (<div>
              <p className="text-xs sm:text-sm font-medium text-closr-text-muted">
                Good afternoon,
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-closr-forest tracking-tight font-normal">
                {title}
              </h1>
            </div>)}
        </div>

        {/* Top Right Header: Date, Notification Bell, & Doctor Profile Avatar */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {actions}

          {/* Shared Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3 text-right">
            <span className="hidden sm:inline-block text-xs sm:text-sm font-medium text-closr-text-muted">
              Thu, Oct 29, 2026
            </span>

            {/* Notification Bell Button */}
            <Link to="/notifications" aria-label={`Notifications (${unreadCount} unread)`} className="relative p-2 rounded-xl bg-closr-card border border-closr-border text-closr-forest hover:bg-closr-sage/40 transition-colors shadow-2xs closr-focus">
              <Bell className="w-4 h-4 stroke-[2]"/>
              {unreadCount > 0 && (<span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-closr-danger text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>)}
            </Link>

            <div className="flex items-center gap-2">
              <Avatar name="Dr. Sharma" size="sm" className="ring-2 ring-closr-border bg-closr-sage text-closr-forest"/>
            </div>
          </div>
        </div>
      </div>

      {subtitle && (<p className="text-sm text-closr-text-muted -mt-2">
          {subtitle}
        </p>)}

      {children}
    </header>);
};
