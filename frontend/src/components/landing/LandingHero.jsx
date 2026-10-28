import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, Calendar, Bot, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';

export const LandingHero = () => {
  const scrollToPortals = () => {
    const el = document.getElementById('portals');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Description & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-closr-sage/60 border border-closr-border text-xs font-semibold text-closr-forest shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-closr-forest" />
              <span>AI-Powered Healthcare Operations</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-closr-forest tracking-tight leading-[1.12]">
              Better Patient Experiences.{' '}
              <span className="text-closr-text">Smarter Clinic Operations.</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-closr-text-muted leading-relaxed max-w-2xl">
              Closr helps healthcare teams simplify appointments, streamline patient communication, and deliver a more responsive patient experience with AI-powered assistance.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={scrollToPortals}
                className="shadow-soft justify-center text-sm font-semibold"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={scrollToFeatures}
                className="border-closr-border bg-closr-card text-closr-text hover:bg-closr-sage/30 justify-center text-sm font-semibold"
              >
                Explore Features
              </Button>
            </div>

            {/* Reassuring trust badges */}
            <div className="pt-6 border-t border-closr-border/80 flex flex-wrap items-center gap-6 text-xs text-closr-text-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-closr-forest" />
                <span>24/7 AI Receptionist</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-closr-forest" />
                <span>Automated Slot Conflict Recovery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-closr-forest" />
                <span>Role-Based Clinic Security</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Platform Preview Card */}
          <div className="lg:col-span-5 relative">
            {/* Subtle background glow */}
            <div className="absolute -inset-4 bg-closr-sage/40 rounded-3xl blur-2xl -z-10" />

            <div className="bg-closr-card border border-closr-border rounded-3xl shadow-xl p-5 sm:p-6 text-left space-y-5">
              {/* Card Top: Live clinic indicator */}
              <div className="flex items-center justify-between pb-3.5 border-b border-closr-border/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-closr-forest text-white flex items-center justify-center font-serif font-bold text-base shadow-2xs">
                    C
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-closr-text">Dr. Sharma Clinic</h3>
                    <p className="text-[11px] text-closr-text-muted">Autonomous Front Desk</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-closr-pale border border-closr-forest/20 text-[11px] font-semibold text-closr-forest">
                  <span className="w-2 h-2 rounded-full bg-closr-forest animate-pulse" />
                  <span>AI Active</span>
                </div>
              </div>

              {/* Chat snippet: AI Receptionist conversation */}
              <div className="bg-closr-bg/80 border border-closr-border rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-closr-forest">
                  <Bot className="w-4 h-4" />
                  <span>AI Receptionist Saathi</span>
                  <span className="text-[10px] text-closr-text-muted font-normal ml-auto">Just now</span>
                </div>
                <p className="text-xs text-closr-text leading-relaxed">
                  "I've verified Dr. Sharma's schedule and confirmed your <strong>5:30 PM</strong> fever consultation slot for today. Booking Code: <code className="bg-white px-1 py-0.5 rounded border border-closr-border font-mono text-[11px] text-closr-forest">SAT-2041</code>."
                </p>
              </div>

              {/* Verified Appointment Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-closr-text-muted">
                  <span>Upcoming Schedule</span>
                  <span className="text-closr-forest">Thu, Oct 29</span>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-white border border-closr-border flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <Avatar name="Anita M." size="sm" className="bg-closr-sage text-closr-forest" />
                      <div>
                        <p className="text-xs font-bold text-closr-text">Anita M.</p>
                        <p className="text-[11px] text-closr-text-muted">4:30 PM · Follow-up</p>
                      </div>
                    </div>
                    <Badge variant="confirmed" size="sm">Confirmed</Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-closr-border flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <Avatar name="Rohit V." size="sm" className="bg-closr-sage text-closr-forest" />
                      <div>
                        <p className="text-xs font-bold text-closr-text">Rohit V.</p>
                        <p className="text-[11px] text-closr-text-muted">5:30 PM · Consultation</p>
                      </div>
                    </div>
                    <Badge variant="confirmed" size="sm">Confirmed</Badge>
                  </div>
                </div>
              </div>

              {/* Status bar */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-closr-text-muted">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-closr-forest" />
                  Self-healing conflict resolution
                </span>
                <span className="font-semibold text-closr-forest">98.4% Autonomous</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
