import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary:
      'bg-[#00f0ff] text-black font-bold hover:bg-[#38bdf8] border border-transparent shadow-[0_0_12px_rgba(0,240,255,0.25)]',
    ghost:
      'bg-transparent text-[#8496b0] hover:text-white hover:bg-[#121d33] border border-transparent',
    outline:
      'bg-[#0a1120] text-slate-200 hover:text-white hover:border-[#00f0ff] border border-[#182844]',
    danger:
      'bg-[#ff3b5c]/15 text-[#ff3b5c] border border-[#ff3b5c]/40 hover:bg-[#ff3b5c]/25',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-6 py-3 text-sm gap-2.5',
  };

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-mono tracking-wider uppercase transition-all duration-150',
        'active:translate-y-[1px] disabled:opacity-40 disabled:pointer-events-none disabled:active:translate-y-0',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
