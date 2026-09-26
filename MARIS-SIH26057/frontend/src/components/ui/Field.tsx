import React from 'react';
import clsx from 'clsx';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export function Field({
  label,
  error,
  helperText,
  id,
  className,
  ...props
}: FieldProps) {
  const inputId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex flex-col space-y-1.5 text-left">
      <label
        htmlFor={inputId}
        className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#8c978f]"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={clsx(
          'w-full border bg-[#070a0f] px-3.5 py-2 font-mono text-xs text-[#e2e8e4] placeholder-[#4d5750] transition-colors rounded-sm',
          'focus:border-[rgba(226,232,228,0.18)] focus:outline-none',
          error ? 'border-[#d93829]' : 'border-[rgba(226,232,228,0.08)]',
          className
        )}
        {...props}
      />
      {error && (
        <span className="font-mono text-[10px] font-semibold text-[#d93829]">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span className="font-mono text-[10px] text-[#8c978f]">
          {helperText}
        </span>
      )}
    </div>
  );
}
