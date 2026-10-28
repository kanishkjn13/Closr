import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

export const PatientSignupPage = () => {
  const { signupPatient } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Mobile number is required.';
    } else {
      const cleanDigits = formData.phone.replace(/[\s\-\(\)\+]/g, '');
      if (cleanDigits.length < 10) {
        errs.phone = 'Please enter a valid 10-digit mobile number.';
      }
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirmation password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.acceptTerms) {
      errs.acceptTerms = 'You must accept the Clinic Terms and Privacy Policy.';
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
      await signupPatient({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      setIsRegistered(true);
      toast.success('Registration Complete', 'Your patient account has been created.');
    } catch (err) {
      setGeneralError(err.message || 'Unable to complete registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
          to="/patient/login"
          className="text-xs font-semibold text-closr-forest hover:underline"
        >
          Already have an account? Sign in &rarr;
        </Link>
      </header>

      {/* Main Card */}
      <main className="max-w-md w-full mx-auto my-auto py-4">
        <div className="bg-closr-card rounded-3xl border border-closr-border shadow-soft p-6 sm:p-8 space-y-6 text-left">
          
          {!isRegistered ? (
            <>
              {/* Header */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-closr-sage/40 border border-closr-border text-xs font-semibold text-closr-forest">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  New Patient Registration
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-closr-text tracking-tight">
                  Create an Account
                </h1>
                <p className="text-xs sm:text-sm text-closr-text-muted leading-relaxed">
                  Join Dr. Sharma's Clinic portal to book consultations and receive digital prescription updates.
                </p>
              </div>

              {/* General Error */}
              {generalError && (
                <div className="p-3.5 rounded-2xl bg-closr-danger-bg/80 border border-closr-danger/30 text-xs text-closr-danger space-y-0.5">
                  <p className="font-semibold">{generalError}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label htmlFor="reg-name" className="block text-xs font-semibold text-closr-text">
                    Full Name
                  </label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, name: e.target.value }));
                      if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    leftIcon={<User className="w-4 h-4 text-closr-text-muted" />}
                    className="bg-white"
                    disabled={isSubmitting}
                  />
                  {errors.name && <p className="text-xs text-closr-danger">{errors.name}</p>}
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label htmlFor="reg-email" className="block text-xs font-semibold text-closr-text">
                    Email Address
                  </label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, email: e.target.value }));
                      if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    leftIcon={<Mail className="w-4 h-4 text-closr-text-muted" />}
                    className="bg-white"
                    disabled={isSubmitting}
                  />
                  {errors.email && <p className="text-xs text-closr-danger">{errors.email}</p>}
                </div>

                {/* Mobile Phone */}
                <div className="space-y-1">
                  <label htmlFor="reg-phone" className="block text-xs font-semibold text-closr-text">
                    Mobile Number
                  </label>
                  <Input
                    id="reg-phone"
                    type="tel"
                    placeholder="+91 98201 44521"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, phone: e.target.value }));
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    leftIcon={<Phone className="w-4 h-4 text-closr-text-muted" />}
                    className="bg-white"
                    disabled={isSubmitting}
                  />
                  {errors.phone && <p className="text-xs text-closr-danger">{errors.phone}</p>}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label htmlFor="reg-password" className="block text-xs font-semibold text-closr-text">
                    Password (Min. 6 characters)
                  </label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, password: e.target.value }));
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
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-closr-danger">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-closr-text">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      id="reg-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                        if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                      }}
                      leftIcon={<Lock className="w-4 h-4 text-closr-text-muted" />}
                      className="bg-white pr-10"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-closr-text-muted hover:text-closr-text"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-closr-danger">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms Acceptance */}
                <div className="pt-1">
                  <div className="flex items-start gap-2">
                    <input
                      id="accept-terms"
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, acceptTerms: e.target.checked }));
                        if (errors.acceptTerms) setErrors((prev) => ({ ...prev, acceptTerms: '' }));
                      }}
                      className="w-4 h-4 mt-0.5 text-closr-forest rounded border-closr-border focus:ring-closr-forest"
                    />
                    <label htmlFor="accept-terms" className="text-xs text-closr-text-muted cursor-pointer leading-tight">
                      I accept Dr. Sharma Clinic's Terms of Service and Privacy Policy for digital healthcare communication.
                    </label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-xs text-closr-danger mt-1">{errors.acceptTerms}</p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full justify-center mt-3 shadow-soft"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Create Patient Account
                </Button>
              </form>
            </>
          ) : (
            /* Registration Success View */
            <div className="space-y-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-closr-success-badge text-closr-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 stroke-[2.4]" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-closr-text">
                  Account Created Successfully
                </h3>
                <p className="text-xs text-closr-text-muted max-w-xs mx-auto leading-relaxed">
                  Welcome to Dr. Sharma's Clinic. You can now sign in using your email ({formData.email}) and password.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/patient/login')}
                  className="w-full justify-center"
                >
                  Proceed to Sign In
                </Button>
              </div>
            </div>
          )}

          {/* Return to Login */}
          <div className="pt-3 border-t border-closr-border text-center text-xs text-closr-text-muted">
            <span>Already registered? </span>
            <Link to="/patient/login" className="text-closr-forest font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center pt-4 text-xs text-closr-text-muted">
        <p>&copy; 2026 Closr Healthcare Operations. Secure Patient Access.</p>
      </footer>
    </div>
  );
};
