import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import { ClosrLogo } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';

export const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-closr-bg text-closr-text p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8 text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-closr-border">
          <Link to="/">
            <ClosrLogo />
          </Link>
          <Link to="/">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Notice Badge */}
        <div className="p-4 rounded-xl bg-closr-amber-bg border border-closr-amber/30 text-closr-text flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-closr-amber shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-closr-text">Platform Legal Document Draft — Pending Clinic Legal Review</p>
            <p className="text-closr-text-muted">
              This policy describes how patient and clinic operational data is handled in the Closr prototype environment. Final legal terms must be executed by your certified healthcare privacy compliance officer.
            </p>
          </div>
        </div>

        {/* Document Body */}
        <div className="bg-closr-card border border-closr-border rounded-2xl p-6 sm:p-8 shadow-soft space-y-6">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-closr-forest">
            Privacy Policy
          </h1>
          <p className="text-xs text-closr-text-muted">Last Updated: October 2026</p>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-closr-text">1. Information We Collect</h2>
            <p className="text-xs text-closr-text-muted leading-relaxed">
              Closr collects only information necessary to deliver appointment coordination and communication services, including patient full name, contact telephone number, email address, and appointment scheduling preferences. Basic account credentials are encrypted and authenticated via secure sessions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-closr-text">2. How Information Is Used</h2>
            <p className="text-xs text-closr-text-muted leading-relaxed">
              Personal information is used solely to verify patient identity, coordinate doctor consultations, transmit appointment reminders, and resolve scheduling collisions. Data is never sold or used for targeted commercial advertising.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-closr-text">3. Access Boundaries & Role Separation</h2>
            <p className="text-xs text-closr-text-muted leading-relaxed">
              Patients may access only their own individual appointment records and conversation logs. Clinic administrators and authorized staff access operational queues subject to clinic role-based access controls.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-closr-text">4. Contacting Your Clinic</h2>
            <p className="text-xs text-closr-text-muted leading-relaxed">
              For inquiries regarding data stored in your patient profile or to request record modifications, contact your clinic front desk directly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
