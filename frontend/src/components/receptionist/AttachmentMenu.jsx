import React, { useRef, useEffect } from 'react';
import { Image, Share2, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
export const AttachmentMenu = ({ isOpen, onClose, onSelectAction, className, }) => {
    const menuRef = useRef(null);
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
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
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    const items = [
        {
            id: 'image',
            label: 'Attach prescription / report (demo)',
            icon: <Image className="w-4 h-4 text-closr-forest"/>,
        },
        {
            id: 'share',
            label: 'Share appointment card (demo)',
            icon: <Share2 className="w-4 h-4 text-closr-forest"/>,
        },
        {
            id: 'consent',
            label: 'Digital consent form (demo)',
            icon: <FileText className="w-4 h-4 text-closr-forest"/>,
        },
    ];
    return (<div ref={menuRef} role="menu" aria-label="Attachment options" className={cn('absolute bottom-16 left-3 z-40 min-w-[240px] bg-closr-card border border-closr-border rounded-2xl shadow-modal py-1.5 animate-in fade-in zoom-in-95 duration-150 text-left', className)}>
      <div className="px-3.5 py-1 text-[10px] font-semibold text-closr-text-muted uppercase tracking-wider border-b border-closr-border/60 mb-1">
        Quick Attach
      </div>
      {items.map((item) => (<button key={item.id} type="button" role="menuitem" onClick={() => {
                onSelectAction(item.label);
                onClose();
            }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-closr-text hover:bg-closr-sage/40 transition-colors text-left">
          <span className="shrink-0">{item.icon}</span>
          <span className="truncate">{item.label}</span>
        </button>))}
    </div>);
};
