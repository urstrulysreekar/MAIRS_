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
        className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#8496b0]"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={clsx(
          'w-full border bg-[#060a12] px-3.5 py-2 font-mono text-xs text-white placeholder-[#4d5e78] transition-colors',
          'focus:border-[#00f0ff] focus:outline-none',
          error ? 'border-[#ff3b5c]' : 'border-[#182844]',
          className
        )}
        {...props}
      />
      {error && (
        <span className="font-mono text-[10px] font-semibold text-[#ff3b5c]">
          {error}
        </span>
      )}
      {!error && helperText && (
        <span className="font-mono text-[10px] text-[#4d5e78]">
          {helperText}
        </span>
      )}
    </div>
  );
}
