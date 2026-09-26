import React from 'react';
import clsx from 'clsx';

interface FrameProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'surface' | 'card' | 'abyss';
  withTicks?: boolean;
}

export function Frame({
  children,
  variant = 'card',
  withTicks = true,
  className,
  ...props
}: FrameProps) {
  const bgStyles = {
    surface: 'bg-[#0b1018]',
    card: 'bg-[#101622]',
    abyss: 'bg-[#070a0f]',
  };

  return (
    <div
      className={clsx(
        'relative border border-[rgba(226,232,228,0.08)] rounded-sm',
        bgStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
