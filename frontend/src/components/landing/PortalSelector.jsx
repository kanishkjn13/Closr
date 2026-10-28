import React from 'react';
import { Link } from 'react-router-dom';
import { User, Building2, Check, ArrowRight, ShieldCheck, HeartPulse, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';

export const PortalSelector = () => {
  return (
    <section id="portals" className="py-16 sm:py-20 bg-closr-pale/40 border-y border-closr-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <span className="text-xs font-bold text-closr-forest bg-closr-sage/60 px-3 py-1 rounded-full border border-closr-border uppercase tracking-wider">
            Portal Access
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-closr-forest tracking-tight">
            Choose Your Portal
          </h2>
          <p className="text-sm sm:text-base text-closr-text-muted leading-relaxed">
            Select the experience that matches your needs.
          </p>
        </div>

        {/* Portal Cards Grid (2-Column) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-5xl mx-auto items-stretch">
          
          {/* Card 1: Patient / Client Portal */}
          <div className="bg-closr-card border-2 border-closr-border hover:border-closr-forest/50 rounded-3xl p-6 sm:p-8 shadow-card flex flex-col justify-between text-left transition-all duration-200 hover:shadow-xl group">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-closr-sage/50 text-closr-forest flex items-center justify-center shadow-xs border border-closr-border group-hover:bg-closr-forest group-hover:text-white transition-colors">
                  <HeartPulse className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-closr-forest bg-closr-pale px-2.5 py-1 rounded-full border border-closr-border">
                  Patients & Clients
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-serif font-bold text-closr-forest">
                  Patient Portal
                </h3>
                <p className="text-sm text-closr-text-muted mt-2 leading-relaxed">
                  Manage your appointments, connect with your clinic, and access your personal healthcare dashboard.
                </p>
              </div>

              {/* Feature List */}
              <div className="space-y-3 pt-2 border-t border-closr-border/80">
                <p className="text-xs font-bold text-closr-text uppercase tracking-wider">
                  Patient Features
                </p>
                <ul className="space-y-2.5 text-xs text-closr-text">
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-closr-pale flex items-center justify-center text-closr-forest shrink-0">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                    <span>Book and manage appointments</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-closr-pale flex items-center justify-center text-closr-forest shrink-0">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                    <span>Communicate directly with clinic reception</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-closr-pale flex items-center justify-center text-closr-forest shrink-0">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                    <span>View upcoming and previous visits</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-closr-pale flex items-center justify-center text-closr-forest shrink-0">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                    <span>Manage your personal profile and records</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link to="/patient/login" className="w-full">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center shadow-soft"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Patient Login
                  </Button>
                </Link>
                <Link to="/patient/signup" className="w-full">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full justify-center border-closr-border bg-white text-closr-text hover:bg-closr-sage/30 font-semibold"
                    leftIcon={<UserPlus className="w-4 h-4" />}
                  >
                    Create Account
                  </Button>
                </Link>
              </div>
              <p className="text-[11px] text-center text-closr-text-muted">
                New patients can create a free account in under 1 minute.
              </p>
            </div>
          </div>

          {/* Card 2: Admin / Clinic Portal */}
          <div className="bg-closr-card border-2 border-closr-border hover:border-closr-forest/50 rounded-3xl p-6 sm:p-8 shadow-card flex flex-col justify-between text-left transition-all duration-200 hover:shadow-xl group relative">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-closr-forest text-white flex items-center justify-center shadow-xs border border-closr-border group-hover:bg-closr-forest-hover transition-colors">
                  <Building2 className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-closr-forest bg-closr-sage/60 px-2.5 py-1 rounded-full border border-closr-border">
                  Authorized Personnel
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-serif font-bold text-closr-forest">
                  Clinic Admin Portal
                </h3>
                <p className="text-sm text-closr-text-muted mt-2 leading-relaxed">
                  Manage clinic operations, appointments, patient communication, and staff workflows from one workspace.
                </p>
              </div>

              {/* Feature List */}
              <div className="space-y-3 pt-2 border-t border-closr-border/80">
                <p className="text-xs font-bold text-closr-text uppercase tracking-wider">
                  Clinic Operations Features
                </p>
                <ul className="space-y-2.5 text-xs text-closr-text">
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-closr-sage/60 flex items-center justify-center text-closr-forest shrink-0">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                    <span>Manage live appointments and patient directory</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-closr-sage/60 flex items-center justify-center text-closr-forest shrink-0">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                    <span>Monitor AI triage and patient conversations</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-closr-sage/60 flex items-center justify-center text-closr-forest shrink-0">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                    <span>Access operational dashboards & notifications</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-closr-sage/60 flex items-center justify-center text-closr-forest shrink-0">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </span>
                    <span>Review operational analytics & recovery proof</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link to="/admin/login" className="w-full">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center shadow-soft"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Admin Login
                  </Button>
                </Link>
                <Link to="/admin/login" className="w-full">
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full justify-center border-closr-border bg-white text-closr-text hover:bg-closr-sage/30 font-semibold"
                    leftIcon={<ShieldCheck className="w-4 h-4" />}
                  >
                    For Clinic Staff
                  </Button>
                </Link>
              </div>
              <p className="text-[11px] text-center text-closr-text-muted flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-closr-forest" />
                <span>Restricted to authorized clinic staff. No public registration.</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
