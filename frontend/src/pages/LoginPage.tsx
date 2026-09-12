import React, { useState, useId } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const baseId = useId();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const [form, setForm] = useState<FormState>({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic client-side validation
    const newErrors: FieldErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
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
        setErrors({ general: error.message ?? 'Login failed. Please try again.' });
      }
    } finally {
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
        {/* Card */}
        <div className="bg-rpg-surface border border-rpg-border rounded-2xl p-8 shadow-2xl shadow-black/40">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3" aria-hidden="true">⚔️</div>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-rpg-text-muted/60 hover:text-rpg-text-muted transition-colors text-lg"
                >
                  {showPassword ? '🙈' : '👁️'}
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
                  <span className="animate-spin text-base" aria-hidden="true">⚙️</span>
                  Entering the realm…
                </>
              ) : (
                <>⚔️ Enter the Realm</>
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
            New to Life RPG?{' '}
            <Link
              to="/signup"
              className="text-rpg-gold hover:text-amber-300 font-medium transition-colors"
            >
              Create your character →
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

export default LoginPage;
