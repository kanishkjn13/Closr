import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { CalendarCheck, MessageSquare, ShieldAlert, Activity, Info, CheckCircle, Mail, Trash2, ExternalLink, } from 'lucide-react';
import { cn } from '../../lib/utils';
export const NotificationListItem = ({ notification, onSelect, onToggleRead, onDismiss, isSelected = false, }) => {
    const navigate = useNavigate();
    const getCategoryIcon = () => {
        switch (notification.category) {
            case 'escalations':
                return <ShieldAlert className="w-4 h-4 text-closr-danger"/>;
            case 'appointments':
                return <CalendarCheck className="w-4 h-4 text-closr-forest"/>;
            case 'conversations':
                return <MessageSquare className="w-4 h-4 text-closr-forest"/>;
            case 'activity':
                return <Activity className="w-4 h-4 text-closr-forest"/>;
            case 'system':
            default:
                return <Info className="w-4 h-4 text-closr-text-muted"/>;
        }
    };
    const handleActionClick = (e) => {
        e.stopPropagation();
        if (notification.destinationRoute) {
            navigate(notification.destinationRoute);
        }
    };
    return (<div onClick={() => onSelect(notification)} className={cn('p-4 rounded-2xl border transition-all cursor-pointer text-left flex items-start gap-3 select-none relative group', !notification.isRead
            ? 'bg-[#FCFBF6] border-closr-border hover:border-closr-forest/50 shadow-soft'
            : 'bg-[#F9F8F3]/60 border-closr-border/70 hover:bg-[#FCFBF6] opacity-85', isSelected && 'ring-2 ring-closr-forest/30 border-closr-forest bg-white')}>
      {/* Category Icon */}
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs', notification.priority === 'urgent'
            ? 'bg-closr-danger-bg text-closr-danger border border-closr-danger/30'
            : 'bg-closr-sage/30 border border-closr-border/60')}>
        {getCategoryIcon()}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Title & Timestamp Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {!notification.isRead && (<span className="w-2 h-2 rounded-full bg-closr-forest shrink-0 animate-pulse"/>)}
            <h4 className={cn('text-xs font-semibold text-closr-text truncate', !notification.isRead && 'font-bold text-closr-forest')}>
              {notification.title}
            </h4>
          </div>

          <span className="text-[10px] text-closr-text-muted shrink-0">
            {notification.timestamp}
          </span>
        </div>

        {/* Description snippet */}
        <p className="text-xs text-closr-text-muted leading-relaxed line-clamp-2">
          {notification.description}
        </p>

        {/* Metadata Badges & Action Link */}
        <div className="pt-1.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {notification.priority !== 'normal' && (<Badge variant={notification.priority === 'urgent' ? 'danger' : 'warning'} size="sm">
                {notification.priority === 'urgent' ? 'Urgent Triage' : 'High Priority'}
              </Badge>)}

            {notification.relatedEscalationId && (<span className="font-mono text-[10px] font-bold text-closr-danger bg-closr-danger-bg px-1.5 py-0.5 rounded border border-closr-danger/20">
                {notification.relatedEscalationId}
              </span>)}

            {notification.relatedBookingId && (<span className="font-mono text-[10px] font-bold text-closr-forest bg-closr-sage/40 px-1.5 py-0.5 rounded border border-closr-border/60">
                {notification.relatedBookingId}
              </span>)}

            {notification.relatedPatientName && (<span className="text-[10px] text-closr-text font-medium bg-white px-1.5 py-0.5 rounded border border-closr-border/60">
                {notification.relatedPatientName}
              </span>)}
          </div>

          {/* Quick Action link */}
          {notification.destinationRoute && (<button type="button" onClick={handleActionClick} className="text-[11px] font-semibold text-closr-forest hover:text-closr-forest-hover flex items-center gap-1 ml-auto">
              <span>{notification.destinationLabel || 'Open Record'}</span>
              <ExternalLink className="w-3 h-3"/>
            </button>)}
        </div>
      </div>

      {/* Hover action menu buttons (Mark read/unread, Dismiss) */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 -mr-1">
        <button type="button" onClick={(e) => {
            e.stopPropagation();
            onToggleRead(notification.id, notification.isRead);
        }} title={notification.isRead ? 'Mark as unread' : 'Mark as read'} className="p-1 rounded-lg text-closr-text-muted hover:text-closr-forest hover:bg-closr-sage/30 transition-colors">
          {notification.isRead ? (<Mail className="w-3.5 h-3.5"/>) : (<CheckCircle className="w-3.5 h-3.5 text-closr-forest"/>)}
        </button>

        <button type="button" onClick={(e) => {
            e.stopPropagation();
            onDismiss(notification.id);
        }} title="Dismiss notification" className="p-1 rounded-lg text-closr-text-muted hover:text-closr-danger hover:bg-closr-danger-bg transition-colors">
          <Trash2 className="w-3.5 h-3.5"/>
        </button>
      </div>
    </div>);
};
