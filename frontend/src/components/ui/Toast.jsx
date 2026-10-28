import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';
const ToastContext = createContext(undefined);
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);
    const addToast = useCallback(({ type, title, description, duration = 4000 }) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast = { id, type, title, description, duration };
        setToasts((prev) => [...prev, newToast]);
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);
    const success = useCallback((title, description) => addToast({ type: 'success', title, description }), [addToast]);
    const error = useCallback((title, description) => addToast({ type: 'error', title, description }), [addToast]);
    const info = useCallback((title, description) => addToast({ type: 'info', title, description }), [addToast]);
    return (<ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast}/>
    </ToastContext.Provider>);
};
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
const ToastContainer = ({ toasts, onDismiss }) => {
    if (toasts.length === 0)
        return null;
    return (<div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
            const icons = {
                success: <CheckCircle2 className="w-5 h-5 text-closr-forest shrink-0 mt-0.5"/>,
                error: <AlertCircle className="w-5 h-5 text-closr-danger shrink-0 mt-0.5"/>,
                info: <Info className="w-5 h-5 text-closr-forest shrink-0 mt-0.5"/>,
            };
            const bgBorders = {
                success: 'bg-closr-card border-closr-sage-dark/60',
                error: 'bg-closr-card border-closr-danger/40',
                info: 'bg-closr-card border-closr-border',
            };
            return (<div key={toast.id} role="status" className={cn('pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-modal animate-in fade-in slide-in-from-bottom-2 duration-200 transition-all', bgBorders[toast.type])}>
            {icons[toast.type]}
            <div className="flex-1 text-left space-y-0.5 min-w-0">
              <p className="text-sm font-semibold text-closr-text tracking-tight">
                {toast.title}
              </p>
              {toast.description && (<p className="text-xs text-closr-text-muted leading-relaxed">
                  {toast.description}
                </p>)}
            </div>
            <button onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification" className="text-closr-text-muted hover:text-closr-text p-1 rounded-md hover:bg-closr-sage/40 transition-colors shrink-0">
              <X className="w-4 h-4"/>
            </button>
          </div>);
        })}
    </div>);
};
