import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

export const AdminForgotPasswordPage = () => {
  const { requestPasswordReset } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your clinic staff email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid clinic email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordReset(email.trim(), 'admin');
      setIsSubmitted(true);
      toast.success('Staff Recovery Dispatched', 'Administrative password recovery initiated.');
    } catch (err) {
      setError(err.message || 'Could not process staff password recovery.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-closr-bg text-closr-text flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-4">
        <Link to="/admin/login" className="flex items-center gap-2.5">
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
      </header>

      {/* Main Card */}
      <main className="max-w-md w-full mx-auto my-auto py-4">
        <div className="bg-closr-card rounded-3xl border border-closr-border shadow-soft p-6 sm:p-8 space-y-6 text-left">
          
          {!isSubmitted ? (
            <>
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-closr-forest text-white text-xs font-semibold">
                  <KeyRound className="w-3.5 h-3.5" />
                  Staff Credential Recovery
                </div>
                <h1 className="font-serif text-2xl font-bold text-closr-text tracking-tight">
                  Reset Staff Credentials
                </h1>
                <p className="text-xs sm:text-sm text-closr-text-muted leading-relaxed">
                  Enter your clinic staff email address to receive password reset authorization.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-closr-danger-bg text-xs text-closr-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="admin-recovery-email" className="block text-xs font-semibold text-closr-text">
                    Clinic Staff Email Address
                  </label>
                  <Input
                    id="admin-recovery-email"
                    type="email"
                    placeholder="staff@sharmaclinic.in"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    leftIcon={<Mail className="w-4 h-4 text-closr-text-muted" />}
                    className="bg-white"
                    disabled={isSubmitting}
                  />
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
                  Send Recovery Link
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
                  Staff Request Dispatched
                </h3>
                <p className="text-xs text-closr-text-muted max-w-xs mx-auto leading-relaxed">
                  If an authorized staff account exists for <strong>{email}</strong>, recovery instructions have been routed through clinic administration.
                </p>
              </div>

              <div className="pt-2">
                <Link to="/admin/login">
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    Return to Admin Login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-closr-border text-center">
            <Link
              to="/admin/login"
              className="text-xs font-semibold text-closr-forest hover:underline inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Admin Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center pt-4 text-xs text-closr-text-muted">
        <p>&copy; 2026 Closr Healthcare Operations. Restricted Security Protocol.</p>
      </footer>
    </div>
  );
};
