import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
export const Dropdown = ({ trigger, items, align = 'right', className, }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    // Close on outside click or Escape key
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);
    return (<div ref={containerRef} className={cn('relative inline-block text-left', className)}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (<div role="menu" aria-orientation="vertical" className={cn('absolute z-40 mt-1.5 min-w-[180px] bg-closr-card border border-closr-border rounded-xl shadow-dropdown py-1.5 animate-in fade-in zoom-in-95 duration-150', align === 'right' ? 'right-0' : 'left-0')}>
          {items.map((item) => (<button key={item.id} role="menuitem" disabled={item.disabled} onClick={() => {
                    if (!item.disabled) {
                        item.onClick?.();
                        setIsOpen(false);
                    }
                }} className={cn('w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-left transition-colors', item.danger
                    ? 'text-closr-danger hover:bg-closr-danger-bg'
                    : 'text-closr-text hover:bg-closr-sage/40', item.disabled && 'opacity-40 cursor-not-allowed')}>
              {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </button>))}
        </div>)}
    </div>);
};
