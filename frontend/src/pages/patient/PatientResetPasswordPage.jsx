import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

export const PatientResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const toast = useToast();
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing or invalid password reset token. Please request a new recovery link.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({ token, newPassword: password, portal: 'patient' });
      setIsSuccess(true);
      toast.success('Password Reset Confirmed', 'You may now sign in with your new password.');
    } catch (err) {
      setError(err.message || 'Password reset failed. The token may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-closr-bg text-closr-text flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-4">
        <Link to="/patient/login" className="flex items-center gap-2.5">
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
      </header>

      {/* Main Card */}
      <main className="max-w-md w-full mx-auto my-auto py-4">
        <div className="bg-closr-card rounded-3xl border border-closr-border shadow-soft p-6 sm:p-8 space-y-6 text-left">
          
          {!isSuccess ? (
            <>
              <div className="space-y-1.5">
                <h1 className="font-serif text-2xl font-bold text-closr-text tracking-tight">
                  Set New Password
                </h1>
                <p className="text-xs sm:text-sm text-closr-text-muted leading-relaxed">
                  Enter your new confidential password for Dr. Sharma's Clinic patient portal.
                </p>
              </div>

              {!token && (
                <div className="p-3.5 rounded-2xl bg-closr-amber-bg border border-closr-amber/30 text-xs text-closr-amber flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>No security token provided in URL. A valid token parameter is required.</span>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-closr-danger-bg text-xs text-closr-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="new-password" className="block text-xs font-semibold text-closr-text">
                    New Password
                  </label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      leftIcon={<Lock className="w-4 h-4 text-closr-text-muted" />}
                      className="bg-white pr-10"
                      disabled={isSubmitting || !token}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-closr-text-muted hover:text-closr-text"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="confirm-new-password" className="block text-xs font-semibold text-closr-text">
                    Confirm New Password
                  </label>
                  <Input
                    id="confirm-new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4 text-closr-text-muted" />}
                    className="bg-white"
                    disabled={isSubmitting || !token}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full justify-center shadow-soft"
                  isLoading={isSubmitting}
                  disabled={isSubmitting || !token}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Update Password
                </Button>
              </form>
            </>
          ) : (
            <div className="space-y-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-closr-success-badge text-closr-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 stroke-[2.4]" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-closr-text">
                  Password Updated
                </h3>
                <p className="text-xs text-closr-text-muted max-w-xs mx-auto leading-relaxed">
                  Your patient account password has been updated. You can now sign in with your new credentials.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/patient/login')}
                  className="w-full justify-center"
                >
                  Sign In to Patient Portal
                </Button>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-closr-border text-center">
            <Link to="/patient/login" className="text-xs font-semibold text-closr-forest hover:underline">
              Return to Patient Login
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center pt-4 text-xs text-closr-text-muted">
        <p>&copy; 2026 Closr Healthcare Operations.</p>
      </footer>
    </div>
  );
};
