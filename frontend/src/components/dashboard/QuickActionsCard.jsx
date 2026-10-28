import React from 'react';
import { Phone, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export const QuickActionsCard = ({ onCallPatient, onOpenChat, }) => {
    const navigate = useNavigate();
    const handleChatClick = () => {
        if (onOpenChat) {
            onOpenChat();
        }
        else {
            navigate('/messages');
        }
    };
    return (<div className="bg-closr-card border border-closr-border rounded-2xl shadow-card p-5 sm:p-6 text-left">
      <h2 className="text-sm sm:text-base font-medium text-closr-text tracking-tight mb-4">
        Quick actions
      </h2>

      <div className="space-y-3">
        {/* Action 1: Call Patient */}
        <button type="button" onClick={onCallPatient} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-closr-border bg-closr-bg/30 text-closr-text hover:bg-closr-sage/30 hover:border-closr-border-dark active:scale-[0.99] transition-all duration-150 text-xs sm:text-[13px] font-medium closr-focus shadow-xs">
          <Phone className="w-4 h-4 text-closr-forest stroke-[2] shrink-0"/>
          <span>Call Patient</span>
        </button>

        {/* Action 2: View Conversations */}
        <button type="button" onClick={handleChatClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-closr-border bg-closr-bg/30 text-closr-text hover:bg-closr-sage/30 hover:border-closr-border-dark active:scale-[0.99] transition-all duration-150 text-xs sm:text-[13px] font-medium closr-focus shadow-xs">
          <MessageSquare className="w-4 h-4 text-closr-forest stroke-[2] shrink-0"/>
          <span>View Conversations</span>
        </button>
      </div>
    </div>);
};
