import React from 'react';
import { cn } from '../../lib/utils';
export const AppointmentSlotPicker = ({ slots = ['5:00 PM', '5:30 PM', '6:15 PM'], selectedSlot, onSelectSlot, className, }) => {
    return (<div role="group" aria-label="Available appointment time slots" className={cn('flex items-center gap-2 pt-2.5 flex-wrap sm:flex-nowrap', className)}>
      {slots.map((slot) => {
            const isSelected = selectedSlot === slot;
            return (<button key={slot} type="button" aria-pressed={isSelected} onClick={() => onSelectSlot(slot)} className={cn('flex-1 min-w-[76px] py-1.5 px-2.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-150 select-none closr-focus active:scale-95 text-center', isSelected
                    ? 'bg-closr-forest text-white shadow-soft ring-1 ring-closr-forest'
                    : 'bg-closr-card border border-closr-border text-closr-text hover:bg-closr-sage/30 hover:border-closr-border-dark')}>
            {slot}
          </button>);
        })}
    </div>);
};
