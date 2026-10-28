import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle, RotateCcw } from 'lucide-react';
export const ResetConfirmModal = ({ isOpen, title = 'Reset Clinic Settings to Defaults?', description = 'This will revert all 7 configuration sections (Profile, Receptionist, Schedule, Notifications, Safety, Appearance) back to their initial Closr demo defaults. Shared appointments and patient profiles will NOT be modified.', onClose, onConfirm, isLoading = false, }) => {
    return (<Modal isOpen={isOpen} onClose={onClose} title={<div className="flex items-center gap-2 text-closr-danger">
          <AlertTriangle className="w-5 h-5 shrink-0"/>
          <span>{title}</span>
        </div>} size="sm">
      <div className="space-y-4 text-left text-xs">
        <p className="text-closr-text leading-relaxed">{description}</p>

        <div className="p-3 rounded-xl bg-closr-danger-bg text-closr-danger border border-closr-danger/30 text-[11px] font-medium leading-relaxed">
          Local browser preferences stored in localStorage will be reset to default demo values.
        </div>

        <div className="pt-3 border-t border-closr-border flex items-center justify-end gap-2.5">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" variant="danger" size="sm" onClick={onConfirm} isLoading={isLoading}>
            <RotateCcw className="w-3.5 h-3.5 mr-1"/>
            Yes, Reset Settings
          </Button>
        </div>
      </div>
    </Modal>);
};
