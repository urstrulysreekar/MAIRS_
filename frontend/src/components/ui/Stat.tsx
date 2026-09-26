import React from 'react';
import clsx from 'clsx';

interface StatProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: {
    value: string | number;
    positive?: boolean;
    label?: string;
  };
  className?: string;
  color?: 'cyan' | 'teal' | 'amber' | 'red' | 'white';
}

export function Stat({
  label,
  value,
  unit,
  trend,
  className,
  color = 'white',
}: StatProps) {
  const colorStyles = {
    cyan: 'text-[#00f0ff]',
    teal: 'text-[#0ac5b2]',
    amber: 'text-[#f59e0b]',
    red: 'text-[#ff3b5c]',
    white: 'text-white',
  };

  return (
    <div className={clsx('flex flex-col space-y-1', className)}>
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#8496b0]">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5 font-mono">
        <span
          className={clsx(
            'text-2xl font-black tabular-slashed tracking-tight',
            colorStyles[color]
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-[#8496b0]">{unit}</span>
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-1 font-mono text-[10px]">
          <span
            className={clsx(
              'font-bold',
              trend.positive ? 'text-[#0ac5b2]' : 'text-[#ff3b5c]'
            )}
          >
            {trend.positive ? '▲' : '▼'} {trend.value}
          </span>
          {trend.label && (
            <span className="text-[#4d5e78]">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
}
