import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Clock, Users, CalendarCheck, Zap } from 'lucide-react';
import { Button } from '../ui/Button';

export const ForClinics = () => {
  return (
    <section id="for-clinics" className="py-16 sm:py-24 bg-closr-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-closr-card border border-closr-border rounded-3xl p-8 sm:p-12 lg:p-16 shadow-card text-left relative overflow-hidden">
          
          {/* Subtle decoration */}
          <div className="absolute right-0 bottom-0 w-96 h-96 bg-closr-sage/30 rounded-full blur-3xl -z-0 pointer-events-none" />

          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-closr-sage/60 border border-closr-border text-xs font-semibold text-closr-forest">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>For Doctors & Clinic Managers</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-closr-forest tracking-tight leading-tight">
              Give Your Clinic a Smarter Front Desk
            </h2>

            <p className="text-sm sm:text-base text-closr-text-muted leading-relaxed">
              Closr coordinates appointments, manages incoming inquiries, and keeps your schedule moving smoothly. Front desk staff gain hours back every week while patients enjoy immediate, reliable responses.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-closr-border shadow-2xs">
                <Clock className="w-5 h-5 text-closr-forest mb-2" />
                <h4 className="font-semibold text-xs text-closr-text">Zero Call Wait Time</h4>
                <p className="text-[11px] text-closr-text-muted mt-0.5">24/7 AI-assisted booking & scheduling answers</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-closr-border shadow-2xs">
                <CalendarCheck className="w-5 h-5 text-closr-forest mb-2" />
                <h4 className="font-semibold text-xs text-closr-text">No Double Bookings</h4>
                <p className="text-[11px] text-closr-text-muted mt-0.5">Live conflict detection and autonomous recovery</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-closr-border shadow-2xs">
                <Zap className="w-5 h-5 text-closr-forest mb-2" />
                <h4 className="font-semibold text-xs text-closr-text">Emergency Triage</h4>
                <p className="text-[11px] text-closr-text-muted mt-0.5">High-priority alerts for acute medical keywords</p>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link to="/admin/login">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="shadow-soft justify-center w-full sm:w-auto"
                >
                  Access Clinic Portal
                </Button>
              </Link>
              <Link to="/receptionist">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-closr-border bg-white text-closr-text hover:bg-closr-sage/30 justify-center w-full sm:w-auto font-semibold"
                >
                  Preview AI Receptionist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
