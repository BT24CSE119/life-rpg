import React, { useState, useId, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { healthCheck } from '../services/api';
import type { ValidationError } from '../types';

interface FormState {
  email: string;
  password: string;
}

interface FieldErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const baseId = useId();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [slowRequest, setSlowRequest] = useState(false);

  // Warm up the Render backend the moment the login page loads
  // so the server is awake by the time the user hits submit.
  useEffect(() => {
    healthCheck().catch(() => {}); // silent — just wake the server
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSlowRequest(false);

    // Basic client-side validation
    const newErrors: FieldErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    // After 3s, hint that the server may be waking up (Render free tier cold start)
    const slowTimer = setTimeout(() => setSlowRequest(true), 3000);
    try {
      await login({ email: form.email, password: form.password });
      navigate(from, { replace: true });
    } catch (err) {
      const error = err as Error & { response?: { data?: { error?: { message?: string; details?: ValidationError[] } } } };
      const apiError = error.response?.data?.error;
      if (apiError?.details) {
        const fieldErrors: FieldErrors = {};
        apiError.details.forEach((d: ValidationError) => {
          (fieldErrors as Record<string, string>)[d.field] = d.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: apiError?.message ?? error.message ?? 'Login failed. Please check your credentials.' });
      }
    } finally {
      clearTimeout(slowTimer);
      setSlowRequest(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-rpg-gold/5 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-rpg-arcane/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Top Back to Home Button */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-rpg-text-muted hover:text-rpg-gold px-3 py-1.5 rounded-lg bg-rpg-surface/80 hover:bg-rpg-surface border border-rpg-border/60 hover:border-rpg-gold/40 transition-all shadow-sm"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to home
          </Link>
        </div>

        {/* Card */}
        <div className="bg-rpg-surface border border-rpg-border rounded-2xl p-8 shadow-2xl shadow-black/40">

          {/* Header & RPG Emblem Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center justify-center mb-5">
              {/* Heraldic Crest Badge */}
              <div className="relative mb-3 group">
                <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-600/30 blur-md group-hover:blur-lg transition-all duration-300" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-b from-[#1c223a] via-[#121627] to-[#0c0e1a] border-2 border-amber-400/80 shadow-[0_4px_20px_rgba(245,200,66,0.35)] flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-amber-400 filter drop-shadow-[0_0_8px_rgba(245,200,66,0.6)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
                    <path d="M13 19l6-6" />
                    <path d="M2 2l6 6" />
                    <path d="M20 16l2-2" />
                    <path d="M16 20l2-2" />
                  </svg>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold font-display uppercase tracking-widest shadow-sm">
                <span>LIFE RPG</span>
                <span className="w-1 h-1 rounded-full bg-amber-400/60" />
                <span className="text-[10px] text-amber-200/70 font-normal">REALM GATE</span>
              </div>
            </div>

            <h1 className="font-display text-3xl font-bold text-rpg-text mb-1">
              Welcome Back
            </h1>
            <p className="text-rpg-text-muted text-sm">
              Continue your adventure, adventurer.
            </p>
          </div>

          {/* General error */}
          {errors.general && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              <span aria-hidden="true">⚠️</span>
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate aria-label="Login form">
            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor={`${baseId}-email`}
                className="block text-sm font-medium text-rpg-text-muted mb-1.5"
              >
                Email Address
              </label>
              <input
                id={`${baseId}-email`}
                type="email"
                name="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                disabled={isSubmitting}
                placeholder="adventurer@realm.com"
                aria-describedby={errors.email ? `${baseId}-email-err` : undefined}
                aria-invalid={!!errors.email}
                className={`w-full px-4 py-3 rounded-xl bg-rpg-bg border text-rpg-text placeholder:text-rpg-text-muted/40 text-sm outline-none transition-all focus:ring-2 focus:ring-rpg-gold/40 disabled:opacity-50 ${
                  errors.email
                    ? 'border-red-500/60 focus:border-red-500/60'
                    : 'border-rpg-border focus:border-rpg-gold/60'
                }`}
              />
              {errors.email && (
                <p id={`${baseId}-email-err`} role="alert" className="mt-1.5 text-xs text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-6">
              <label
                htmlFor={`${baseId}-password`}
                className="block text-sm font-medium text-rpg-text-muted mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id={`${baseId}-password`}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="••••••••"
                  aria-describedby={errors.password ? `${baseId}-password-err` : undefined}
                  aria-invalid={!!errors.password}
                  className={`w-full px-4 py-3 pr-11 rounded-xl bg-rpg-bg border text-rpg-text placeholder:text-rpg-text-muted/40 text-sm outline-none transition-all focus:ring-2 focus:ring-rpg-gold/40 disabled:opacity-50 ${
                    errors.password
                      ? 'border-red-500/60 focus:border-red-500/60'
                      : 'border-rpg-border focus:border-rpg-gold/60'
                  }`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-rpg-text-muted/50 hover:text-rpg-gold transition-colors p-1 rounded"
                >
                  {showPassword ? (
                    // Eye-off icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p id={`${baseId}-password-err`} role="alert" className="mt-1.5 text-xs text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-xl font-semibold text-rpg-bg bg-gradient-to-r from-rpg-gold to-amber-400 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:brightness-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-rpg-bg/40 border-t-rpg-bg rounded-full animate-spin" aria-hidden="true" />
                  {slowRequest ? 'Server is waking up… (~15s)' : 'Entering the realm…'}
                </>
              ) : (
                <>⚔️ Enter the Realm</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-rpg-border" />
            <span className="text-rpg-text-muted/40 text-xs uppercase tracking-wider font-semibold">Or continue with</span>
            <div className="flex-1 h-px bg-rpg-border" />
          </div>

          {/* Google Sign-In */}
          <div className="mb-6">
            <GoogleSignInButton
              mode="login"
              onError={(msg) => setErrors((prev) => ({ ...prev, general: msg }))}
            />
          </div>

          {/* Footer link */}
          <p className="text-center text-sm text-rpg-text-muted">
            New to Life RPG?{' '}
            <Link
              to="/signup"
              className="text-rpg-gold hover:text-amber-300 font-medium transition-colors"
            >
              Create your character →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
