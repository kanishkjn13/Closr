import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldAlert, 
  HeartHandshake, 
  UserCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PATIENT_ACCOUNTS } from '../../services/authService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

export const PatientLoginPage = () => {
  const { loginPatient, isAuthenticated, isPatient } = useAuth();
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

  // Redirect if already authenticated as patient
  useEffect(() => {
    if (isAuthenticated && isPatient) {
      const from = location.state?.from?.pathname || '/patient/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isPatient, navigate, location.state]);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
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
      const user = await loginPatient({
        email: email.trim(),
        password,
        rememberMe,
      });

      toast.success('Welcome Back', `Signed in as ${user.name}`);
      const destination = location.state?.from?.pathname || '/patient/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setGeneralError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Patient123!');
    setErrors({});
    setGeneralError('');
  };

  return (
    <div className="min-h-screen bg-closr-bg text-closr-text flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-4">
        <Link to="/patient/login" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-closr-forest text-white flex items-center justify-center font-serif font-bold text-xl shadow-xs">
            C
          </div>
          <div>
            <span className="font-serif font-bold text-xl text-closr-text tracking-tight block leading-tight">
              Closr
            </span>
            <span className="text-[11px] text-closr-text-muted">
              Patient Care Portal
            </span>
          </div>
        </Link>

        <Link
          to="/admin/login"
          className="text-xs font-semibold text-closr-text-muted hover:text-closr-forest transition-colors flex items-center gap-1.5"
        >
          Staff &amp; Admin Sign In &rarr;
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto py-4">
        <div className="bg-closr-card rounded-3xl border border-closr-border shadow-soft p-6 sm:p-8 space-y-6 text-left">
          
          {/* Header Texts */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-closr-sage/40 border border-closr-border text-xs font-semibold text-closr-forest">
              <HeartHandshake className="w-3.5 h-3.5" />
              Patient Access
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-closr-text tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-closr-text-muted leading-relaxed">
              Sign in to manage your appointments and stay connected with your care team.
            </p>
          </div>

          {/* General Error Banner */}
          {generalError && (
            <div className="p-3.5 rounded-2xl bg-closr-danger-bg/80 border border-closr-danger/30 text-xs text-closr-danger space-y-0.5">
              <p className="font-semibold">{generalError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="patient-email" className="block text-xs font-semibold text-closr-text">
                Email Address
              </label>
              <Input
                id="patient-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
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

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="patient-password" className="block text-xs font-semibold text-closr-text">
                  Password
                </label>
                <Link
                  to="/patient/forgot-password"
                  className="text-xs text-closr-forest hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Input
                  id="patient-password"
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

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="patient-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-closr-forest rounded border-closr-border focus:ring-closr-forest"
              />
              <label htmlFor="patient-remember-me" className="text-xs text-closr-text-muted cursor-pointer">
                Keep me signed in on this device
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center mt-2 shadow-soft"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Patient Portal
            </Button>
          </form>

          {/* Quick Demo Accounts Helper */}
          <div className="pt-2 border-t border-closr-border space-y-2">
            <span className="text-[11px] font-semibold text-closr-text-muted uppercase tracking-wider block">
              Quick Demo Patient Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_PATIENT_ACCOUNTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleQuickDemoFill(p.email)}
                  className="p-2 rounded-xl border border-closr-border bg-white/70 hover:bg-white hover:border-closr-forest/50 text-left text-xs transition-all shadow-2xs group"
                >
                  <p className="font-semibold text-closr-text truncate group-hover:text-closr-forest">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-closr-text-muted truncate">
                    {p.email}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* New Patient Signup Link */}
          <div className="pt-3 border-t border-closr-border text-center text-xs text-closr-text-muted">
            <span>New patient at Dr. Sharma's Clinic? </span>
            <Link to="/patient/signup" className="text-closr-forest font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center pt-4 text-xs text-closr-text-muted">
        <p>&copy; 2026 Closr Healthcare Operations. Protected by clinical session authorization.</p>
      </footer>
    </div>
  );
};
