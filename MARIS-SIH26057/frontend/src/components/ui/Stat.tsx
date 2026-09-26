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
    cyan: 'text-[#3b7b99]',
    teal: 'text-[#5b937c]',
    amber: 'text-[#d99b26]',
    red: 'text-[#d93829]',
    white: 'text-[#e2e8e4]',
  };

  return (
    <div className={clsx('flex flex-col space-y-1', className)}>
      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#8c978f]">
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
          <span className="text-xs font-semibold text-[#8c978f]">{unit}</span>
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-1 font-mono text-[10px]">
          <span
            className={clsx(
              'font-bold',
              trend.positive ? 'text-[#5b937c]' : 'text-[#d93829]'
            )}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
          {trend.label && (
            <span className="text-[#8c978f]">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  );
}
