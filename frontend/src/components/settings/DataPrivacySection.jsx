import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { settingsService } from '../../services/settingsService';
import { ResetConfirmModal } from './ResetConfirmModal';
import { Database, ShieldCheck, RotateCcw, AlertTriangle, HardDrive, Info } from 'lucide-react';
export const DataPrivacySection = ({ onResetAllSettings, }) => {
    const toast = useToast();
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const handleConfirmReset = () => {
        setIsResetting(true);
        try {
            settingsService.resetToDefaults();
            onResetAllSettings();
            setIsResetModalOpen(false);
            toast.success('All clinic settings restored to demo defaults');
        }
        catch {
            toast.error('Failed to reset settings');
        }
        finally {
            setIsResetting(false);
        }
    };
    const handleResetPreferencesOnly = () => {
        try {
            settingsService.updateAppearance({
                theme: 'light',
                density: 'comfortable',
                showQuickActions: true,
                dateFormat: 'DD/MM/YYYY',
                timeFormat: '12h',
            });
            settingsService.updateNotifications({
                confirmations: true,
                upcomingReminders: true,
                cancellations: true,
                rescheduling: true,
                escalationAlerts: true,
                dailySummary: true,
                leadTimeHours: 2,
                channels: { inApp: true, whatsapp: true, sms: true, email: false },
            });
            toast.success('Appearance and notification preferences reset to defaults');
        }
        catch {
            toast.error('Could not reset preferences');
        }
    };
    return (<div className="p-6 rounded-2xl bg-closr-card border border-closr-border shadow-soft text-left space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-serif font-bold text-lg text-closr-text flex items-center gap-2">
          <Database className="w-5 h-5 text-closr-forest"/>
          Data Architecture & Session Privacy
        </h3>
        <p className="text-xs text-closr-text-muted mt-1">
          Understand how Closr stores clinic configurations and manages frontend state in demo mode.
        </p>
      </div>

      <div className="space-y-5 text-xs">
        {/* Mandatory Demo Privacy Notice */}
        <div className="p-4 rounded-2xl bg-closr-sage/30 border border-closr-border space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-closr-forest"/>
            <span className="font-semibold text-closr-text text-xs">
              Frontend Demo Architecture Notice
            </span>
            <Badge variant="confirmed" size="sm">
              Local Mode
            </Badge>
          </div>
          <p className="text-closr-text-muted leading-relaxed text-[11px]">
            Closr is running in <strong>demo mode</strong>. Settings and preferences are stored
            locally in this frontend session via your browser's <code className="text-closr-forest font-semibold">localStorage</code> and
            are never transmitted to an external clinic database or third-party server.
          </p>
        </div>

        {/* Storage Health Card */}
        <div className="p-4 rounded-xl bg-white border border-closr-border/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-closr-text flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-closr-forest"/>
              Browser Session State
            </span>
            <span className="text-[10px] text-closr-forest font-semibold bg-closr-sage/40 px-2 py-0.5 rounded-full border border-closr-border">
              Synchronized
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-closr-card border border-closr-border/60">
              <span className="text-[10px] text-closr-text-muted uppercase font-semibold">
                Configuration Key
              </span>
              <p className="font-mono text-xs font-bold text-closr-text mt-0.5">
                closr_clinic_settings
              </p>
            </div>

            <div className="p-3 rounded-lg bg-closr-card border border-closr-border/60">
              <span className="text-[10px] text-closr-text-muted uppercase font-semibold">
                Scope
              </span>
              <p className="text-xs font-semibold text-closr-text mt-0.5">
                Client-only (No telemetry)
              </p>
            </div>
          </div>
        </div>

        {/* Reset Actions Section */}
        <div className="p-4 rounded-xl bg-white border border-closr-border/80 shadow-2xs space-y-3">
          <h4 className="text-xs font-semibold text-closr-text flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-closr-amber"/>
            Reset & Revert Operations
          </h4>

          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-closr-border bg-closr-card">
              <div>
                <p className="font-semibold text-closr-text text-xs">
                  Restore All Settings to Defaults
                </p>
                <p className="text-[11px] text-closr-text-muted mt-0.5">
                  Revert clinic profile, appointment schedule rules, and receptionist preferences.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsResetModalOpen(true)} className="shrink-0 text-closr-danger hover:border-closr-danger hover:bg-closr-danger-bg">
                <RotateCcw className="w-3 h-3 mr-1"/>
                Reset All Settings
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-closr-border bg-closr-card">
              <div>
                <p className="font-semibold text-closr-text text-xs">
                  Reset Display & Notification Rules Only
                </p>
                <p className="text-[11px] text-closr-text-muted mt-0.5">
                  Revert density and alert toggles without resetting clinic name or address.
                </p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={handleResetPreferencesOnly} className="shrink-0">
                Reset Preferences
              </Button>
            </div>
          </div>
        </div>

        {/* Protection Note */}
        <div className="p-3 rounded-xl bg-[#EDEBE3] text-[11px] text-closr-text-muted border border-closr-border flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-closr-forest shrink-0 mt-0.5"/>
          <span>
            <strong>Data Integrity Guarantee:</strong> Reverting clinic settings will not erase or
            alter existing patient profiles, appointment bookings, or messaging history from
            Phases 1–6.
          </span>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ResetConfirmModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} onConfirm={handleConfirmReset} isLoading={isResetting}/>
    </div>);
};
