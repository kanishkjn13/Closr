import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { X, CalendarCheck, MessageSquare, ShieldAlert, Activity, Info, Clock, ExternalLink, CheckCircle, Mail, Trash2, BookmarkCheck, User, } from 'lucide-react';
import { cn } from '../../lib/utils';
export const NotificationDetailsDrawer = ({ notification, onClose, onToggleRead, onDismiss, className, }) => {
    const navigate = useNavigate();
    if (!notification)
        return null;
    const getCategoryIcon = () => {
        switch (notification.category) {
            case 'escalations':
                return <ShieldAlert className="w-5 h-5 text-closr-danger"/>;
            case 'appointments':
                return <CalendarCheck className="w-5 h-5 text-closr-forest"/>;
            case 'conversations':
                return <MessageSquare className="w-5 h-5 text-closr-forest"/>;
            case 'activity':
                return <Activity className="w-5 h-5 text-closr-forest"/>;
            case 'system':
            default:
                return <Info className="w-5 h-5 text-closr-text-muted"/>;
        }
    };
    const handleOpenDestination = () => {
        if (notification.destinationRoute) {
            navigate(notification.destinationRoute);
        }
    };
    return (<div className={cn('w-full sm:w-[360px] xl:w-[400px] bg-closr-card border-l border-closr-border flex flex-col h-full shadow-lg text-left select-none overflow-y-auto shrink-0', className)}>
      {/* Header */}
      <div className="p-4 border-b border-closr-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-closr-text-muted uppercase tracking-wider">
            Notification Details
          </span>
          <Badge variant={notification.priority === 'urgent'
            ? 'danger'
            : notification.priority === 'high'
                ? 'warning'
                : 'neutral'} size="sm">
            {notification.priority}
          </Badge>
        </div>

        <button type="button" onClick={onClose} aria-label="Close details" className="p-1 rounded-lg text-closr-text-muted hover:text-closr-text hover:bg-closr-sage/30 transition-colors closr-focus">
          <X className="w-4 h-4"/>
        </button>
      </div>

      <div className="p-5 space-y-5 text-xs flex-1">
        {/* Title and Icon */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-closr-sage/30 border border-closr-border flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
            {getCategoryIcon()}
          </div>
          <div className="space-y-1 min-w-0">
            <h3 className="font-serif font-bold text-base text-closr-text leading-snug">
              {notification.title}
            </h3>
            <div className="flex items-center gap-2 text-closr-text-muted text-[11px]">
              <Clock className="w-3 h-3 text-closr-forest"/>
              <span>{notification.timestamp}</span>
              <span>·</span>
              <span className="capitalize">{notification.category}</span>
            </div>
          </div>
        </div>

        {/* Full Description Card */}
        <div className="p-4 rounded-xl bg-white border border-closr-border shadow-2xs space-y-2">
          <span className="text-[10px] uppercase font-semibold text-closr-text-muted">
            Event Description
          </span>
          <p className="text-xs text-closr-text leading-relaxed font-sans">
            {notification.description}
          </p>
        </div>

        {/* Related Entity References */}
        <div className="p-4 rounded-xl bg-white border border-closr-border shadow-2xs space-y-3">
          <span className="text-[10px] uppercase font-semibold text-closr-text-muted">
            Associated Clinic Records
          </span>

          <div className="space-y-2 text-xs">
            {notification.relatedPatientName && (<div className="flex items-center justify-between text-closr-text">
                <span className="text-closr-text-muted flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-closr-forest"/> Patient
                </span>
                <span className="font-semibold">{notification.relatedPatientName}</span>
              </div>)}

            {notification.relatedBookingId && (<div className="flex items-center justify-between text-closr-text">
                <span className="text-closr-text-muted flex items-center gap-1.5">
                  <BookmarkCheck className="w-3.5 h-3.5 text-closr-forest"/> Booking ID
                </span>
                <span className="font-mono font-bold text-closr-forest">
                  {notification.relatedBookingId}
                </span>
              </div>)}

            {notification.relatedEscalationId && (<div className="flex items-center justify-between text-closr-text">
                <span className="text-closr-text-muted flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-closr-danger"/> Escalation ID
                </span>
                <span className="font-mono font-bold text-closr-danger">
                  {notification.relatedEscalationId}
                </span>
              </div>)}

            {notification.relatedConversationId && (<div className="flex items-center justify-between text-closr-text">
                <span className="text-closr-text-muted flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-closr-forest"/> Conversation
                </span>
                <span className="font-mono font-semibold text-closr-text">
                  {notification.relatedConversationId}
                </span>
              </div>)}
          </div>
        </div>

        {/* Primary Destination Action */}
        {notification.destinationRoute && (<Button type="button" variant="primary" size="md" onClick={handleOpenDestination} className="w-full flex items-center justify-center gap-2 shadow-soft">
            <span>{notification.destinationLabel || 'Open Related Record'}</span>
            <ExternalLink className="w-3.5 h-3.5"/>
          </Button>)}
      </div>

      {/* Footer Drawer Actions */}
      <div className="p-4 border-t border-closr-border flex items-center justify-between gap-2 bg-[#F6F4EC]/60">
        <button type="button" onClick={() => onToggleRead(notification.id, notification.isRead)} className="py-1.5 px-3 rounded-xl border border-closr-border bg-white text-xs font-semibold text-closr-text hover:bg-closr-sage/30 transition-colors flex items-center gap-1.5 shadow-2xs">
          {notification.isRead ? (<>
              <Mail className="w-3.5 h-3.5 text-closr-forest"/>
              <span>Mark Unread</span>
            </>) : (<>
              <CheckCircle className="w-3.5 h-3.5 text-closr-forest"/>
              <span>Mark Read</span>
            </>)}
        </button>

        <button type="button" onClick={() => {
            onDismiss(notification.id);
            onClose();
        }} className="py-1.5 px-3 rounded-xl border border-closr-danger/30 bg-white text-xs font-semibold text-closr-danger hover:bg-closr-danger-bg transition-colors flex items-center gap-1.5 shadow-2xs">
          <Trash2 className="w-3.5 h-3.5"/>
          <span>Dismiss</span>
        </button>
      </div>
    </div>);
};
