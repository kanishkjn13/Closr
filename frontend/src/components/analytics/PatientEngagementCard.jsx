import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, AlertCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
export const PatientEngagementCard = ({ engagement, className, }) => {
    const navigate = useNavigate();
    const totalTrackedPatients = engagement.newPatients + engagement.returningPatients;
    const newPercent = totalTrackedPatients > 0
        ? Math.round((engagement.newPatients / totalTrackedPatients) * 100)
        : 0;
    const returningPercent = 100 - newPercent;
    return (<div className={cn('p-5 rounded-2xl bg-closr-card border border-closr-border shadow-soft flex flex-col justify-between text-left space-y-4', className)}>
      {/* Header */}
      <div>
        <h3 className="font-serif font-bold text-base text-closr-text flex items-center gap-2">
          <Users className="w-4 h-4 text-closr-forest"/>
          Patient Engagement
        </h3>
        <p className="text-xs text-closr-text-muted mt-0.5">
          Patient interactions, new registrations, and care retention
        </p>
      </div>

      <div className="space-y-3">
        {/* Metric tiles */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <button type="button" onClick={() => navigate('/patients')} className="p-3 rounded-xl bg-white border border-closr-border/80 shadow-2xs space-y-1 text-left hover:border-closr-forest hover:bg-closr-sage/20 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold text-closr-text-muted flex items-center gap-1">
                <Users className="w-3 h-3 text-closr-forest"/> Assisted
              </span>
              <ArrowRight className="w-3 h-3 text-closr-text-muted group-hover:text-closr-forest transition-colors"/>
            </div>
            <span className="font-serif font-bold text-xl text-closr-text block">
              {engagement.uniquePatients}
            </span>
            <span className="text-[10px] text-closr-text-muted">Unique patients</span>
          </button>

          <button type="button" onClick={() => navigate('/messages')} className="p-3 rounded-xl bg-white border border-closr-border/80 shadow-2xs space-y-1 text-left hover:border-closr-forest hover:bg-closr-sage/20 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold text-closr-text-muted flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-closr-amber"/> Attention
              </span>
              <ArrowRight className="w-3 h-3 text-closr-text-muted group-hover:text-closr-forest transition-colors"/>
            </div>
            <span className="font-serif font-bold text-xl text-closr-text block">
              {engagement.conversationsNeedingAttention}
            </span>
            <span className="text-[10px] text-closr-text-muted">Chats needing staff</span>
          </button>
        </div>

        {/* New vs Returning Patients Bar */}
        <div className="p-3.5 rounded-xl bg-white border border-closr-border/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-closr-text flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-closr-forest"/>
              New vs Returning Ratio
            </span>
            <span className="text-[11px] text-closr-text-muted font-medium">
              {engagement.newPatients} New · {engagement.returningPatients} Returning
            </span>
          </div>

          {/* Segmented bar */}
          <div className="w-full bg-[#E2E9DF] h-3 rounded-full overflow-hidden flex">
            <div className="bg-closr-forest h-full transition-all duration-500" style={{ width: `${newPercent}%` }} title={`New Patients: ${newPercent}%`}/>
            <div className="bg-[#2D6A4F]/60 h-full transition-all duration-500" style={{ width: `${returningPercent}%` }} title={`Returning Patients: ${returningPercent}%`}/>
          </div>

          <div className="flex items-center justify-between text-[10px] text-closr-text-muted pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-closr-forest"/>
              New Registrations ({newPercent}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F]/60"/>
              Returning / Follow-ups ({returningPercent}%)
            </span>
          </div>
        </div>

        {/* Unread Messages Banner */}
        <button type="button" onClick={() => navigate('/messages')} className="w-full p-2.5 rounded-xl bg-white border border-closr-border/80 hover:border-closr-forest hover:bg-closr-sage/20 transition-all flex items-center justify-between text-xs group">
          <div className="flex items-center gap-2 text-closr-text">
            <MessageSquare className="w-3.5 h-3.5 text-closr-forest"/>
            <span className="font-semibold text-[11px]">Unread Receptionist Messages</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-closr-forest text-xs">
              {engagement.unreadConversations} unread
            </span>
            <ArrowRight className="w-3 h-3 text-closr-text-muted group-hover:text-closr-forest transition-colors"/>
          </div>
        </button>
      </div>
    </div>);
};
