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
    surface: 'bg-[#0a1120]',
    card: 'bg-[#0d1627]',
    abyss: 'bg-[#060a12]',
  };

  return (
    <div
      className={clsx(
        'relative border border-[#182844]',
        bgStyles[variant],
        withTicks && 'corner-bracket',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
