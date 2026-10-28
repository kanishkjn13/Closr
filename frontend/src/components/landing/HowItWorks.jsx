import React from 'react';
import { Compass, KeyRound, Layout } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      title: 'Choose Your Portal',
      description: 'Select either the Patient Portal for personal appointment booking or the Clinic Admin Portal for staff operations.',
      icon: <Compass className="w-6 h-6 text-closr-forest" />,
    },
    {
      step: '02',
      title: 'Sign In or Create an Account',
      description: 'Patients register with basic details, while authorized clinic personnel authenticate with clinic-provisioned credentials.',
      icon: <KeyRound className="w-6 h-6 text-closr-forest" />,
    },
    {
      step: '03',
      title: 'Access Your Dashboard',
      description: 'Experience your dedicated workspace — manage personal visits as a patient, or oversee clinic operations as staff.',
      icon: <Layout className="w-6 h-6 text-closr-forest" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-closr-pale/30 border-t border-closr-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16 space-y-3">
          <span className="text-xs font-bold text-closr-forest bg-closr-sage/60 px-3 py-1 rounded-full border border-closr-border uppercase tracking-wider">
            Simple 3-Step Flow
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-closr-forest tracking-tight">
            How Closr Works
          </h2>
          <p className="text-sm sm:text-base text-closr-text-muted leading-relaxed">
            From initial visit to personalized care coordination in three simple steps.
          </p>
        </div>

        {/* 3 Steps - Horizontal on Desktop, Vertical on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className="bg-closr-card border border-closr-border rounded-2xl p-6 sm:p-7 shadow-soft text-left relative flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-closr-sage/50 flex items-center justify-center border border-closr-border">
                    {item.icon}
                  </div>
                  <span className="font-serif font-bold text-3xl text-closr-forest/20">
                    {item.step}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-lg text-closr-text">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-closr-text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-[2px] bg-closr-border z-10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
