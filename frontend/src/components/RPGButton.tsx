import React from 'react';

// ── Variant definitions ───────────────────────────────────────────────────────

type Variant = 'gold' | 'emerald' | 'arcane' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface RPGButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  gold: [
    'bg-rpg-gradient-gold text-rpg-bg font-semibold',
    'shadow-rpg-gold',
    'hover:brightness-110 hover:shadow-[0_0_28px_rgba(245,200,66,0.45)]',
    'active:brightness-90 active:scale-[0.98]',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100',
  ].join(' '),

  emerald: [
    'bg-rpg-gradient-emerald text-white font-semibold',
    'shadow-rpg-emerald',
    'hover:brightness-110 hover:shadow-[0_0_28px_rgba(16,185,129,0.45)]',
    'active:brightness-90 active:scale-[0.98]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),

  arcane: [
    'bg-rpg-gradient-arcane text-white font-semibold',
    'shadow-rpg-arcane',
    'hover:brightness-110 hover:shadow-[0_0_28px_rgba(124,58,237,0.45)]',
    'active:brightness-90 active:scale-[0.98]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),

  ghost: [
    'bg-transparent text-rpg-gold font-medium',
    'border border-rpg-gold/40',
    'hover:bg-rpg-gold/10 hover:border-rpg-gold/70',
    'active:scale-[0.98]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),

  danger: [
    'bg-rpg-danger text-white font-semibold',
    'hover:bg-rpg-danger/90',
    'active:scale-[0.98]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
};

const sizeClasses: Record<Size, string> = {
  sm:  'px-3 py-1.5 text-sm rounded-rpg-sm gap-1.5',
  md:  'px-5 py-2.5 text-sm rounded-rpg gap-2',
  lg:  'px-7 py-3 text-base rounded-rpg-lg gap-2',
  xl:  'px-9 py-4 text-lg rounded-rpg-lg gap-2.5',
};

// ── Component ─────────────────────────────────────────────────────────────────

const RPGButton: React.FC<RPGButtonProps> = ({
  variant = 'gold',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={[
        // Base
        'relative inline-flex items-center justify-center',
        'font-body transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rpg-gold focus-visible:ring-offset-2 focus-visible:ring-offset-rpg-bg',
        // Variant & size
        variantClasses[variant],
        sizeClasses[size],
        // Full width
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {!isLoading && leftIcon && (
        <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="shrink-0" aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  );
};

export default RPGButton;
