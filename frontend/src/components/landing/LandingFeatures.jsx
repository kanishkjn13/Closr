import React from 'react';
import {
  Bot,
  Calendar,
  MessageSquare,
  UserCheck,
  LayoutDashboard,
  BarChart2,
} from 'lucide-react';

export const LandingFeatures = () => {
  const features = [
    {
      id: 'ai-receptionist',
      title: 'AI Receptionist',
      description: 'Assist with common patient queries, symptom triage, and automated appointment booking 24/7.',
      icon: <Bot className="w-6 h-6 text-closr-forest" />,
    },
    {
      id: 'appointment-management',
      title: 'Appointment Management',
      description: 'Organize daily schedules, manage availability, handle waitlists, and prevent double-booking.',
      icon: <Calendar className="w-6 h-6 text-closr-forest" />,
    },
    {
      id: 'patient-communication',
      title: 'Patient Communication',
      description: 'Keep patient and clinic conversations organized across channels with automated reminder cadences.',
      icon: <MessageSquare className="w-6 h-6 text-closr-forest" />,
    },
    {
      id: 'patient-dashboard',
      title: 'Patient Dashboard',
      description: 'Give patients a dedicated, secure space to view scheduled visits, communicate, and update profile data.',
      icon: <UserCheck className="w-6 h-6 text-closr-forest" />,
    },
    {
      id: 'clinic-dashboard',
      title: 'Clinic Dashboard',
      description: 'Help authorized staff manage day-to-day operations, review patient queues, and handle escalations.',
      icon: <LayoutDashboard className="w-6 h-6 text-closr-forest" />,
    },
    {
      id: 'operational-analytics',
      title: 'Operational Analytics',
      description: 'Present available clinic activity, self-healing recovery rates, and operational performance data.',
      icon: <BarChart2 className="w-6 h-6 text-closr-forest" />,
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-closr-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16 space-y-3">
          <span className="text-xs font-bold text-closr-forest bg-closr-sage/60 px-3 py-1 rounded-full border border-closr-border uppercase tracking-wider">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-closr-forest tracking-tight">
            Everything Your Clinic Needs to Stay Connected
          </h2>
          <p className="text-sm sm:text-base text-closr-text-muted leading-relaxed">
            Integrated tools designed specifically for modern healthcare practices and patient peace of mind.
          </p>
        </div>

        {/* 6-Grid Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="p-6 rounded-2xl bg-closr-card border border-closr-border shadow-soft flex flex-col justify-between text-left transition-all duration-150 hover:border-closr-forest/30 hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-closr-sage/50 flex items-center justify-center border border-closr-border shadow-2xs">
                  {feature.icon}
                </div>
                <h3 className="font-serif font-bold text-lg text-closr-text">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-closr-text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
