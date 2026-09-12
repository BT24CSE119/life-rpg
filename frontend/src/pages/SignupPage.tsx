import React, { useState, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/auth';
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

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const baseId = useId();

  const [form, setForm] = useState<FormState>({ username: '', email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: FieldErrors = {};
    if (!form.username.trim()) newErrors.username = 'Username is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const error = err as Error & {
        response?: { data?: { error?: { message?: string; details?: ValidationError[] } } };
      };
      const apiError = error.response?.data?.error;
      if (apiError?.details) {
        const fieldErrors: FieldErrors = {};
        apiError.details.forEach((d: ValidationError) => {
          (fieldErrors as Record<string, string>)[d.field] = d.message;
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ general: error.message ?? 'Signup failed. Please try again.' });
      }
    } finally {
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
        <div className="bg-rpg-surface border border-rpg-border rounded-2xl p-8 shadow-2xl shadow-black/40">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3" aria-hidden="true">🛡️</div>
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
              <label
                htmlFor={`${baseId}-username`}
                className="block text-sm font-medium text-rpg-text-muted mb-1.5"
              >
                Username
              </label>
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
                aria-invalid={!!errors.username}
                className={`w-full px-4 py-3 rounded-xl bg-rpg-bg border text-rpg-text placeholder:text-rpg-text-muted/40 text-sm outline-none transition-all focus:ring-2 focus:ring-rpg-gold/40 disabled:opacity-50 ${
                  errors.username
                    ? 'border-red-500/60 focus:border-red-500/60'
                    : 'border-rpg-border focus:border-rpg-gold/60'
                }`}
              />
              {errors.username && (
                <p id={`${baseId}-username-err`} role="alert" className="mt-1.5 text-xs text-red-400">
                  {errors.username}
                </p>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-rpg-text-muted/60 hover:text-rpg-text-muted transition-colors text-lg"
                >
                  {showPassword ? '🙈' : '👁️'}
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
                  <span className="animate-spin text-base" aria-hidden="true">⚙️</span>
                  Forging your destiny…
                </>
              ) : (
                <>🛡️ Begin Your Adventure</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-rpg-border" />
            <span className="text-rpg-text-muted/40 text-xs">OR</span>
            <div className="flex-1 h-px bg-rpg-border" />
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

        {/* Back to home */}
        <div className="text-center mt-5">
          <Link
            to="/"
            className="text-xs text-rpg-text-muted/50 hover:text-rpg-text-muted transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
