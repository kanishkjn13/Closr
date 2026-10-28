import React from 'react';
import { ActivityTimelineItem } from './ActivityTimelineItem';
import { Avatar } from '../ui/Avatar';
export const ActivityTimeline = ({ events, onSelectEscalation, }) => {
    return (<div className="bg-closr-card border border-closr-border rounded-2xl shadow-card p-5 sm:p-6 text-left h-full flex flex-col justify-between">
      {/* Header with Saathi avatar icon & title matching screenshot */}
      <div className="flex items-center gap-3 mb-5 pb-2">
        <Avatar name="Saathi AI" size="sm" className="bg-closr-sage/80 text-closr-forest ring-1 ring-closr-border"/>
        <h2 className="text-sm sm:text-base font-medium text-closr-text tracking-tight">
          Recent Activity
        </h2>
      </div>

      {/* Timeline items list */}
      <div className="flex-1 space-y-0.5">
        {events.map((event, index) => (<ActivityTimelineItem key={event.id} event={event} isLast={index === events.length - 1} onClick={event.category === 'escalation' ? onSelectEscalation : undefined}/>))}
      </div>
    </div>);
};
