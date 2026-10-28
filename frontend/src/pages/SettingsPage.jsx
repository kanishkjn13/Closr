import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Badge } from '../components/ui/Badge';
import { SettingsNav } from '../components/settings/SettingsNav';
import { ClinicProfileSection } from '../components/settings/ClinicProfileSection';
import { ReceptionistSection } from '../components/settings/ReceptionistSection';
import { AppointmentRulesSection } from '../components/settings/AppointmentRulesSection';
import { NotificationsSection } from '../components/settings/NotificationsSection';
import { EscalationSafetySection } from '../components/settings/EscalationSafetySection';
import { AppearanceSection } from '../components/settings/AppearanceSection';
import { DataPrivacySection } from '../components/settings/DataPrivacySection';
import { settingsService } from '../services/settingsService';
export const SettingsPage = () => {
    const { onOpenMobileMenu } = useOutletContext();
    const [searchParams, setSearchParams] = useSearchParams();
    // Active section management - default to escalationSafety (AI Core & Patient Safety)
    const initialSection = searchParams.get('section') || 'escalationSafety';
    const [activeSection, setActiveSection] = useState(['escalationSafety', 'receptionist', 'appointmentRules', 'notifications', 'profile', 'appearance', 'dataPrivacy'].includes(initialSection)
        ? initialSection
        : 'escalationSafety');
    // Settings State
    const [settings, setSettings] = useState(() => settingsService.getSettings());
    // Update URL param when section changes
    const handleSelectSection = (section) => {
        setActiveSection(section);
        setSearchParams({ section });
    };
    // Sync if URL search params change externally
    useEffect(() => {
        const sectionParam = searchParams.get('section');
        if (sectionParam &&
            ['profile', 'receptionist', 'appointmentRules', 'notifications', 'escalationSafety', 'appearance', 'dataPrivacy'].includes(sectionParam) &&
            sectionParam !== activeSection) {
            setActiveSection(sectionParam);
        }
    }, [searchParams, activeSection]);
    const handleRefreshSettings = () => {
        setSettings(settingsService.getSettings());
    };
    return (<div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <PageHeader title="Settings" subtitle="Configure your clinic, receptionist preferences, and daily operations." onOpenMobileMenu={onOpenMobileMenu}/>
        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="sm" className="bg-[#EDEBE3] text-closr-text-muted border-closr-border">
            Demo Mode
          </Badge>
          <Badge variant="confirmed" size="sm">
            Saved Locally
          </Badge>
        </div>
      </div>

      {/* Main Settings Layout (Desktop 2-Column: Navigation + Form Panel) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Navigation Menu */}
        <SettingsNav activeSection={activeSection} onSelectSection={handleSelectSection} className="w-full lg:w-auto shrink-0"/>

        {/* Content Panel */}
        <div className="flex-1 w-full min-w-0">
          {activeSection === 'profile' && (<ClinicProfileSection initialProfile={settings.profile} onSaved={(updated) => setSettings((prev) => ({ ...prev, profile: updated }))}/>)}

          {activeSection === 'receptionist' && (<ReceptionistSection initialSettings={settings.receptionist} onSaved={(updated) => setSettings((prev) => ({ ...prev, receptionist: updated }))}/>)}

          {activeSection === 'appointmentRules' && (<AppointmentRulesSection initialRules={settings.appointmentRules} onSaved={(updated) => setSettings((prev) => ({ ...prev, appointmentRules: updated }))}/>)}

          {activeSection === 'notifications' && (<NotificationsSection initialNotifications={settings.notifications} onSaved={(updated) => setSettings((prev) => ({ ...prev, notifications: updated }))}/>)}

          {activeSection === 'escalationSafety' && (<EscalationSafetySection initialSafety={settings.escalationSafety} onSaved={(updated) => setSettings((prev) => ({ ...prev, escalationSafety: updated }))}/>)}

          {activeSection === 'appearance' && (<AppearanceSection initialAppearance={settings.appearance} onSaved={(updated) => setSettings((prev) => ({ ...prev, appearance: updated }))}/>)}

          {activeSection === 'dataPrivacy' && (<DataPrivacySection initialPrivacy={settings.dataPrivacy} onResetAllSettings={handleRefreshSettings}/>)}
        </div>
      </div>
    </div>);
};
