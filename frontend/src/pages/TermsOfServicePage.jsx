import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { ClosrLogo } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';

export const TermsOfServicePage = () => {
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
            <p className="font-bold text-closr-text">Terms of Service Draft — Prototype Advisory Notice</p>
            <p className="text-closr-text-muted">
              These terms govern use of the Closr clinic receptionist and operations interface. Closr provides operational scheduling tools and is not an emergency response provider or diagnostic system.
            </p>
          </div>
        </div>

        {/* Document Body */}
        <div className="bg-closr-card border border-closr-border rounded-2xl p-6 sm:p-8 shadow-soft space-y-6">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-closr-forest">
            Terms of Service
          </h1>
          <p className="text-xs text-closr-text-muted">Last Updated: October 2026</p>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-closr-text">1. Nature of the Service</h2>
            <p className="text-xs text-closr-text-muted leading-relaxed">
              Closr operates as an appointment coordination, communication facilitation, and operational management platform for clinics and patients. Closr does not provide direct medical diagnoses or prescription authorizations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-closr-text">2. Emergency Medical Situations</h2>
            <p className="text-xs text-closr-text-muted leading-relaxed">
              In cases of acute medical emergency, chest pain, difficulty breathing, or severe trauma, users must immediately contact emergency telephone services (such as 108/112) or proceed to the nearest hospital emergency room.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-closr-text">3. User Accounts and Verification</h2>
            <p className="text-xs text-closr-text-muted leading-relaxed">
              Patients agree to provide accurate contact information for appointment bookings. Clinic staff access is restricted to authorized individuals provisioned by clinic administration.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
