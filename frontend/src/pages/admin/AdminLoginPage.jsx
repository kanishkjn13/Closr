import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldAlert, 
  Stethoscope, 
  Building2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_STAFF_ACCOUNTS } from '../../services/authService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

export const AdminLoginPage = () => {
  const { loginAdmin, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in as staff, redirect to operations dashboard
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location.state]);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Staff email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid clinic email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const staffUser = await loginAdmin({
        email: email.trim(),
        password,
        rememberMe,
      });

      toast.success('Admin Authentication Succeeded', `Logged in as ${staffUser.name} (${staffUser.role})`);
      const destination = location.state?.from?.pathname || '/admin/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setGeneralError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStaffFill = (staffEmail) => {
    setEmail(staffEmail);
    setPassword('StaffPass123!');
    setErrors({});
    setGeneralError('');
  };

  return (
    <div className="min-h-screen bg-closr-bg text-closr-text flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-closr-forest text-white flex items-center justify-center font-serif font-bold text-xl shadow-xs">
            C
          </div>
          <div>
            <span className="font-serif font-bold text-xl text-closr-text tracking-tight block leading-tight">
              Closr
            </span>
            <span className="text-[11px] text-closr-text-muted">
              Clinic Operations &amp; Administration
            </span>
          </div>
        </Link>

        <Link
          to="/patient/login"
          className="text-xs font-semibold text-closr-text-muted hover:text-closr-forest transition-colors flex items-center gap-1.5"
        >
          Patient Portal Sign In &rarr;
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto py-4">
        <div className="bg-closr-card rounded-3xl border border-closr-border shadow-soft p-6 sm:p-8 space-y-6 text-left">
          
          {/* Header */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-closr-forest text-white text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              Staff &amp; Admin Access
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-closr-text tracking-tight">
              Admin Portal
            </h1>
            <p className="text-xs sm:text-sm text-closr-text-muted leading-relaxed">
              Sign in to manage clinic operations, appointment schedules, and patient triage services.
            </p>
          </div>

          {/* Security Notice */}
          <div className="p-3.5 rounded-2xl bg-[#F0EFEB] border border-closr-border/80 text-xs text-closr-text-muted space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-closr-text">
              <ShieldAlert className="w-4 h-4 text-closr-amber shrink-0" />
              <span>Restricted Clinic Administration</span>
            </div>
            <p>
              Access is strictly restricted to authorized clinic physicians, administrative staff, and receptionists.
            </p>
          </div>

          {/* General Error Banner */}
          {generalError && (
            <div className="p-3.5 rounded-2xl bg-closr-danger-bg/80 border border-closr-danger/30 text-xs text-closr-danger font-semibold">
              {generalError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="admin-email" className="block text-xs font-semibold text-closr-text">
                Clinic Email Address
              </label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="staff@sharmaclinic.in"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                leftIcon={<Mail className="w-4 h-4 text-closr-text-muted" />}
                className="bg-white"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-xs text-closr-danger mt-1 font-medium">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="admin-password" className="block text-xs font-semibold text-closr-text">
                  Password
                </label>
                <Link
                  to="/admin/forgot-password"
                  className="text-xs text-closr-forest hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  leftIcon={<Lock className="w-4 h-4 text-closr-text-muted" />}
                  className="bg-white pr-10"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-closr-text-muted hover:text-closr-text"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-closr-danger mt-1 font-medium">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                id="admin-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-closr-forest rounded border-closr-border focus:ring-closr-forest"
              />
              <label htmlFor="admin-remember-me" className="text-xs text-closr-text-muted cursor-pointer">
                Remember staff station
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center shadow-soft"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Operations
            </Button>
          </form>

          {/* Quick Demo Staff Accounts Helper */}
          <div className="pt-2 border-t border-closr-border space-y-2">
            <span className="text-[11px] font-semibold text-closr-text-muted uppercase tracking-wider block">
              Authorized Demo Staff Roles:
            </span>
            <div className="space-y-1.5">
              {DEMO_STAFF_ACCOUNTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleQuickStaffFill(s.email)}
                  className="w-full p-2.5 rounded-xl border border-closr-border bg-white/70 hover:bg-white hover:border-closr-forest/50 text-left text-xs transition-all shadow-2xs flex items-center justify-between group"
                >
                  <div>
                    <p className="font-semibold text-closr-text group-hover:text-closr-forest">
                      {s.name} <span className="text-[10px] text-closr-text-muted font-normal">({s.title})</span>
                    </p>
                    <p className="text-[10px] text-closr-text-muted">
                      {s.email}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-closr-sage/40 text-closr-forest border border-closr-border">
                    {s.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center pt-4 text-xs text-closr-text-muted">
        <p>&copy; 2026 Closr Clinic Operations. Authorized Personnel Only.</p>
      </footer>
    </div>
  );
};
