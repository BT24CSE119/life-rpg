import React, { useState, useId, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { signup, checkUsername } from '../services/auth';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { healthCheck } from '../services/api';
import type { ValidationError } from '../types';

interface FormState {
  username: string;
  email: string;
  password: string;
}

interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
  general?: string;
}

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
];

const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const SignupPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const baseId = useId();

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const [form, setForm] = useState<FormState>({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [slowRequest, setSlowRequest] = useState(false);

  // Real-time username availability & suggestions state
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Warm up the Render backend the moment the signup page loads
  useEffect(() => {
    healthCheck().catch(() => {}); // silent — just wake the server
  }, []);

  // Debounced check whenever username changes
  useEffect(() => {
    const trimmed = form.username.trim();
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    if (trimmed.length < 3) {
      setUsernameAvailable(null);
      setUsernameSuggestions([]);
      setUsernameChecking(false);
      return;
    }

    setUsernameChecking(true);
    checkTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await checkUsername(trimmed);
        setUsernameChecking(false);
        setUsernameAvailable(res.available);
        if (!res.available && res.suggestions) {
          setUsernameSuggestions(res.suggestions);
          setErrors((prev) => ({
            ...prev,
            username: 'This username is already taken. Try one below:',
          }));
        } else {
          setUsernameSuggestions([]);
          setErrors((prev) => ({ ...prev, username: undefined }));
        }
      } catch {
        setUsernameChecking(false);
      }
    }, 450);

    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, [form.username]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const handleSelectSuggestion = (suggested: string) => {
    setForm((prev) => ({ ...prev, username: suggested }));
    setUsernameSuggestions([]);
    setUsernameAvailable(true);
    setErrors((prev) => ({ ...prev, username: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: FieldErrors = {};
    const trimmedUsername = form.username.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedUsername) {
      newErrors.username = 'Username is required';
    } else if (trimmedUsername.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    } else if (usernameAvailable === false) {
      newErrors.username = 'Please choose an available username';
    }

    if (!trimmedEmail) {
      newErrors.email = 'Email address is required';
    } else if (!STRICT_EMAIL_REGEX.test(trimmedEmail) || !trimmedEmail.includes('.')) {
      newErrors.email = 'Please enter a valid email address (e.g. name@gmail.com)';
    } else {
      const parts = trimmedEmail.split('@');
      const domain = parts[1]?.toLowerCase() || '';
      const domainParts = domain.split('.');
      if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
        newErrors.email = 'Invalid email domain (e.g. gmail.com)';
      }
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setSlowRequest(false);
    const slowTimer = setTimeout(() => setSlowRequest(true), 3000);
    try {
      await signup({
        username: trimmedUsername,
        email: trimmedEmail,
        password: form.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const error = err as Error & {
        response?: {
          data?: {
            error?: {
              message?: string;
              field?: string;
              suggestions?: string[];
              details?: ValidationError[];
            };
          };
        };
      };
      const apiError = error.response?.data?.error;
      if (apiError?.suggestions && apiError.suggestions.length > 0) {
        setUsernameSuggestions(apiError.suggestions);
        setUsernameAvailable(false);
        setErrors({ username: 'This username is taken. Try one of these available names:' });
      } else if (apiError?.details) {
        const fieldErrors: FieldErrors = {};
        apiError.details.forEach((d: ValidationError) => {
          (fieldErrors as Record<string, string>)[d.field] = d.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: apiError?.message ?? error.message ?? 'Signup failed. Please try again.' });
      }
    } finally {
      clearTimeout(slowTimer);
      setSlowRequest(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] rounded-full bg-rpg-emerald/5 blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-rpg-arcane/5 blur-[100px]" />
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
                <span className="text-[10px] text-amber-200/70 font-normal">HERO AWAKENING</span>
              </div>
            </div>

            <h1 className="font-display text-3xl font-bold text-rpg-text mb-1">
              Create Your Character
            </h1>
            <p className="text-rpg-text-muted text-sm">
              Begin your legendary adventure today.
            </p>
          </div>

          {/* Success state */}
          {success && (
            <div
              role="status"
              aria-live="polite"
              className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-rpg-emerald/10 border border-rpg-emerald/30 text-emerald-400 text-sm"
            >
              <span aria-hidden="true">✅</span>
              <span>Character created! Redirecting to login…</span>
            </div>
          )}

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

          <form onSubmit={handleSubmit} noValidate aria-label="Signup form">
            {/* Username */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor={`${baseId}-username`}
                  className="block text-sm font-medium text-rpg-text-muted"
                >
                  Username
                </label>
                {usernameChecking && (
                  <span className="text-xs text-rpg-gold flex items-center gap-1 animate-pulse">
                    <span>⚙️</span> Checking availability...
                  </span>
                )}
                {!usernameChecking && usernameAvailable === true && form.username.trim().length >= 3 && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                    <span>✓</span> Username available!
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id={`${baseId}-username`}
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={form.username}
                  onChange={handleChange}
                  disabled={isSubmitting || success}
                  placeholder="DragonSlayer99"
                  aria-describedby={errors.username ? `${baseId}-username-err` : undefined}
                  aria-invalid={!!errors.username || usernameAvailable === false}
                  className={`w-full px-4 py-3 pr-10 rounded-xl bg-rpg-bg border text-rpg-text placeholder:text-rpg-text-muted/40 text-sm outline-none transition-all focus:ring-2 focus:ring-rpg-gold/40 disabled:opacity-50 ${
                    errors.username || usernameAvailable === false
                      ? 'border-red-500/60 focus:border-red-500/60'
                      : usernameAvailable === true && form.username.trim().length >= 3
                      ? 'border-emerald-500/60 focus:border-emerald-500/60'
                      : 'border-rpg-border focus:border-rpg-gold/60'
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm">
                  {usernameChecking && <span className="animate-spin inline-block">⏳</span>}
                  {!usernameChecking && usernameAvailable === true && form.username.trim().length >= 3 && (
                    <span className="text-emerald-400">✓</span>
                  )}
                  {!usernameChecking && usernameAvailable === false && (
                    <span className="text-red-400">✗</span>
                  )}
                </div>
              </div>

              {errors.username && (
                <p id={`${baseId}-username-err`} role="alert" className="mt-1.5 text-xs text-red-400">
                  {errors.username}
                </p>
              )}

              {/* Suggestions chips if username is taken */}
              {usernameSuggestions.length > 0 && (
                <div className="mt-2.5 p-3 rounded-xl bg-rpg-bg/90 border border-amber-500/30">
                  <p className="text-xs text-amber-300/90 font-medium mb-1.5 flex items-center gap-1.5">
                    <span>💡</span> Click an available username to claim it:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {usernameSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-rpg-surface border border-rpg-gold/40 hover:border-rpg-gold hover:bg-rpg-gold/20 text-rpg-gold transition-all cursor-pointer active:scale-95 shadow-sm"
                      >
                        +{suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
                disabled={isSubmitting || success}
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
            <div className="mb-4">
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
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={isSubmitting || success}
                  placeholder="••••••••"
                  aria-describedby={`${baseId}-pw-rules`}
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p role="alert" className="mt-1.5 text-xs text-red-400">
                  {errors.password}
                </p>
              )}

              {/* Password strength rules */}
              {form.password && (
                <ul id={`${baseId}-pw-rules`} className="mt-2.5 space-y-1" aria-label="Password requirements">
                  {PASSWORD_RULES.map((rule) => {
                    const met = rule.test(form.password);
                    return (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                          met ? 'text-emerald-400' : 'text-rpg-text-muted/50'
                        }`}
                      >
                        <span aria-hidden="true">{met ? '✓' : '○'}</span>
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Submit */}
            <button
              id="signup-submit-btn"
              type="submit"
              disabled={isSubmitting || success}
              className="w-full mt-2 py-3 px-6 rounded-xl font-semibold text-rpg-bg bg-gradient-to-r from-rpg-emerald to-teal-400 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:brightness-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-rpg-bg/40 border-t-rpg-bg rounded-full animate-spin" aria-hidden="true" />
                  {slowRequest ? 'Server is waking up… (~15s)' : 'Forging your destiny…'}
                </>
              ) : (
                <>🛡️ Begin Your Adventure</>
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
              mode="signup"
              onError={(msg) => setErrors((prev) => ({ ...prev, general: msg }))}
            />
          </div>

          {/* Footer link */}
          <p className="text-center text-sm text-rpg-text-muted">
            Already an adventurer?{' '}
            <Link
              to="/login"
              className="text-rpg-gold hover:text-amber-300 font-medium transition-colors"
            >
              Enter the realm →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
