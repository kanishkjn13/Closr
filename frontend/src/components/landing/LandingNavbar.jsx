import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { ClosrLogo } from '../layout/Sidebar';
import { Button } from '../ui/Button';

export const LandingNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-closr-bg/90 backdrop-blur-md border-b border-closr-border/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <ClosrLogo />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-closr-text-muted">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-closr-forest transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('features')}
            className="hover:text-closr-forest transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-closr-forest transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('for-clinics')}
            className="hover:text-closr-forest transition-colors cursor-pointer"
          >
            For Clinics
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('contact')}
            className="hover:text-closr-forest transition-colors cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scrollToSection('portals')}
            className="border-closr-border bg-closr-card text-closr-text hover:bg-closr-sage/30 font-semibold"
          >
            Sign In
          </Button>

          <Button
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => scrollToSection('portals')}
            className="shadow-soft"
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => scrollToSection('portals')}
            className="text-xs px-3 py-1.5"
          >
            Portals
          </Button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-closr-text-muted hover:text-closr-text hover:bg-closr-sage/40 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-closr-card border-b border-closr-border shadow-xl px-5 py-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-3 text-sm font-semibold text-closr-text">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left py-2 hover:text-closr-forest"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="text-left py-2 hover:text-closr-forest"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="text-left py-2 hover:text-closr-forest"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('for-clinics')}
              className="text-left py-2 hover:text-closr-forest"
            >
              For Clinics
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('contact')}
              className="text-left py-2 hover:text-closr-forest"
            >
              Contact
            </button>
          </nav>

          <div className="pt-4 border-t border-closr-border space-y-2">
            <p className="text-xs font-semibold text-closr-text-muted uppercase tracking-wider">Access Portals</p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/patient/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-closr-sage/40 text-closr-forest text-xs font-semibold hover:bg-closr-sage/70 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Patient Portal</span>
              </Link>
              <Link
                to="/admin/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-closr-forest text-white text-xs font-semibold hover:bg-closr-forest-hover transition-colors shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Clinic Staff</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
