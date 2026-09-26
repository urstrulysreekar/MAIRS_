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
      'bg-[#3b7b99] text-[#070a0f] font-bold hover:opacity-90 border border-transparent',
    ghost:
      'bg-transparent text-[#8c978f] hover:text-[#e2e8e4] hover:bg-[#161e2e] border border-transparent',
    outline:
      'bg-[#101622] text-[#e2e8e4] hover:text-[#e2e8e4] hover:border-[#3b7b99] border border-[rgba(226,232,228,0.08)]',
    danger:
      'bg-[#d93829]/15 text-[#d93829] border border-[#d93829]/40 hover:bg-[#d93829]/25',
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
        'active:translate-y-[1px] disabled:opacity-40 disabled:pointer-events-none disabled:active:translate-y-0 rounded-sm',
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
