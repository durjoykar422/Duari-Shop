import React, { useState } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'buyNow'
  | 'outline'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'ghost'
  | 'icon';

export interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  pulse?: boolean;
  shimmer?: boolean;
  ripple?: boolean;
  children?: React.ReactNode;
  fullWidth?: boolean;
}

interface RippleEffect {
  x: number;
  y: number;
  id: number;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  pulse = false,
  shimmer = true,
  ripple = true,
  children,
  fullWidth = false,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const [ripples, setRipples] = useState<RippleEffect[]>([]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!ripple || disabled || isLoading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { x, y, id: Date.now() };

    setRipples((prev) => [...prev.slice(-3), newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  // Base styles
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium tracking-tight overflow-hidden select-none cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none rounded-lg';

  // Size styles
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-md',
    md: 'text-sm px-4 py-2.5 gap-2 rounded-lg font-semibold',
    lg: 'text-base px-6 py-3.5 gap-2.5 rounded-xl font-bold shadow-sm',
    icon: 'p-2 rounded-lg aspect-square',
  }[size];

  // Variant styles
  const variantStyles = {
    primary:
      'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:from-blue-600 hover:to-indigo-600 focus:ring-blue-500 border border-blue-400/30',
    buyNow:
      'bg-gradient-to-r from-[#0d2354] via-[#0f3479] to-[#142850] text-white shadow-md shadow-slate-900/30 hover:shadow-xl hover:shadow-blue-900/40 hover:from-[#133273] hover:to-[#1a3875] focus:ring-blue-600 border border-blue-400/20 font-bold',
    outline:
      'bg-white text-blue-700 border-2 border-blue-600/80 hover:bg-blue-50/70 hover:border-blue-700 shadow-sm focus:ring-blue-400 font-semibold',
    secondary:
      'bg-slate-100 text-slate-700 hover:bg-slate-200/90 hover:text-slate-900 border border-slate-200 focus:ring-slate-400',
    accent:
      'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 hover:from-amber-400 hover:to-orange-400 focus:ring-amber-400 border border-amber-300/30',
    success:
      'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 focus:ring-emerald-400 border border-emerald-400/30 font-bold',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300',
    icon: 'bg-blue-900/90 text-white hover:bg-blue-800 shadow-sm hover:shadow focus:ring-blue-400',
  }[variant];

  const widthStyle = fullWidth ? 'w-full' : '';
  const pulseStyle = pulse ? 'animate-pulse-glow ring-2 ring-blue-400/50' : '';

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      onPointerDown={handlePointerDown}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${pulseStyle} ${className}`}
      {...props}
    >
      {/* Light sheen / shimmer effect */}
      {shimmer && !disabled && !isLoading && (
        <span
          className="absolute inset-0 pointer-events-none w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out"
          style={{ animation: 'shimmer 3.5s infinite ease-in-out' }}
        />
      )}

      {/* Ripple wave indicators */}
      {ripples.map((rip) => (
        <span
          key={rip.id}
          className="absolute rounded-full bg-white/35 pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{
            left: rip.x,
            top: rip.y,
            width: 14,
            height: 14,
            animation: 'ripple 0.6s ease-out forwards',
          }}
        />
      ))}

      {/* Loading state or icon + text */}
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </span>
      ) : (
        <span className="relative z-10 flex items-center justify-center gap-2 w-full">
          {leftIcon && (
            <motion.span
              whileHover={{ rotate: [-4, 4, 0] }}
              transition={{ duration: 0.3 }}
              className="inline-flex shrink-0 items-center justify-center"
            >
              {leftIcon}
            </motion.span>
          )}
          {children && <span>{children}</span>}
          {rightIcon && (
            <motion.span
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
              className="inline-flex shrink-0 items-center justify-center"
            >
              {rightIcon}
            </motion.span>
          )}
        </span>
      )}
    </motion.button>
  );
};
