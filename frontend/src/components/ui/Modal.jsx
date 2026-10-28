import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { IconButton } from './IconButton';
export const Modal = ({ isOpen, onClose, title, description, children, footer, size = 'md', closeOnBackdropClick = true, }) => {
    const modalRef = useRef(null);
    const titleId = React.useId();
    const descId = React.useId();
    // Escape key handler
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined} aria-describedby={description ? descId : undefined}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-closr-forest/25 backdrop-blur-[2px] transition-opacity duration-200" onClick={() => closeOnBackdropClick && onClose()} aria-hidden="true"/>

      {/* Modal Card */}
      <div ref={modalRef} className={cn('relative w-full bg-closr-card border border-closr-border rounded-2xl shadow-modal overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]', sizeClasses[size])}>
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 pb-3 border-b border-closr-border/60">
          <div className="space-y-1 pr-6">
            {title && (<h2 id={titleId} className="text-lg sm:text-xl font-semibold text-closr-text tracking-tight">
                {title}
              </h2>)}
            {description && (<p id={descId} className="text-xs sm:text-sm text-closr-text-muted">
                {description}
              </p>)}
          </div>
          <IconButton size="sm" aria-label="Close modal" onClick={onClose} icon={<X className="w-4 h-4 text-closr-text-muted"/>} className="hover:bg-closr-sage/50 shrink-0"/>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-sm text-closr-text">
          {children}
        </div>

        {/* Footer */}
        {footer && (<div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-closr-border/60 bg-closr-bg/40">
            {footer}
          </div>)}
      </div>
    </div>);
};
