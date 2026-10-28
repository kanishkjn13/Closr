import React from 'react';
import { Link } from 'react-router-dom';
import { ClosrLogo } from '../layout/Sidebar';
import { Mail, Phone, MapPin, ShieldCheck, Heart } from 'lucide-react';

export const LandingFooter = () => {
  return (
    <footer id="contact" className="bg-closr-card border-t border-closr-border text-closr-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 text-left">
          
          {/* Brand Info (Col 1-2) */}
          <div className="lg:col-span-2 space-y-4">
            <ClosrLogo />
            <p className="text-xs sm:text-sm text-closr-text-muted leading-relaxed max-w-sm">
              Closr is an AI-powered healthcare receptionist and clinic operations platform. We help medical teams streamline appointments and deliver responsive, reassuring care.
            </p>
            <div className="flex items-center gap-2 text-xs text-closr-forest font-semibold pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Healthcare Information Privacy Architecture</span>
            </div>
          </div>

          {/* Product Portals (Col 3) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-closr-forest uppercase tracking-wider">
              Portals & Access
            </h4>
            <ul className="space-y-2 text-xs text-closr-text-muted">
              <li>
                <Link to="/patient/login" className="hover:text-closr-forest transition-colors">
                  Patient Login
                </Link>
              </li>
              <li>
                <Link to="/patient/signup" className="hover:text-closr-forest transition-colors">
                  Create Patient Account
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-closr-forest transition-colors">
                  Clinic Admin Portal
                </Link>
              </li>
              <li>
                <Link to="/receptionist" className="hover:text-closr-forest transition-colors">
                  AI Receptionist Kiosk
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies (Col 4) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-closr-forest uppercase tracking-wider">
              Platform & Legal
            </h4>
            <ul className="space-y-2 text-xs text-closr-text-muted">
              <li>
                <Link to="/privacy-policy" className="hover:text-closr-forest transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-closr-forest transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="text-closr-text-muted/70 text-[11px]">
                  Role-Based Access Control
                </span>
              </li>
              <li>
                <span className="text-closr-text-muted/70 text-[11px]">
                  Audit Log Compliance
                </span>
              </li>
            </ul>
          </div>

          {/* Contact (Col 5) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-closr-forest uppercase tracking-wider">
              Clinic Contact
            </h4>
            <ul className="space-y-2 text-xs text-closr-text-muted">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-closr-forest shrink-0" />
                <span>Dr. Sharma Clinic, Suite 402</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-closr-forest shrink-0" />
                <span>reception@sharmaclinic.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-closr-forest shrink-0" />
                <span>+91 98450 12345</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-closr-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-closr-text-muted">
          <p>&copy; {new Date().getFullYear()} Closr Healthcare Systems. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Built with care for patients & clinicians</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
