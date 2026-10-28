import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingHero } from '../components/landing/LandingHero';
import { PortalSelector } from '../components/landing/PortalSelector';
import { LandingFeatures } from '../components/landing/LandingFeatures';
import { HowItWorks } from '../components/landing/HowItWorks';
import { ForClinics } from '../components/landing/ForClinics';
import { LandingFooter } from '../components/landing/LandingFooter';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-closr-bg text-closr-text font-sans flex flex-col selection:bg-closr-forest selection:text-white">
      {/* 1. Navigation Bar */}
      <LandingNavbar />

      {/* 2. Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <LandingHero />

        {/* Portal Selection Section (Primary User Journey Choice) */}
        <PortalSelector />

        {/* Platform Capabilities / Features */}
        <LandingFeatures />

        {/* How It Works Flow */}
        <HowItWorks />

        {/* For Clinics Section */}
        <ForClinics />
      </main>

      {/* 3. Footer */}
      <LandingFooter />
    </div>
  );
};
