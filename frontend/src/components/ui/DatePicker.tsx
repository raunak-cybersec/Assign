'use client';

import React from 'react';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function DatePicker({
  label,
  error,
  className = '',
  id,
  ...props
}: DatePickerProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[#3f3f46] mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="date"
        min={today}
        className={`
          w-full px-3 py-2 rounded-lg border text-sm text-[#1c1c1e]
          bg-white cursor-pointer
          border-[#e4e4e7] focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20
          outline-none transition-all duration-150
          ${error ? 'border-[#dc2626] focus:border-[#dc2626] focus:ring-[#dc2626]/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-[#dc2626]">{error}</p>
      )}
    </div>
  );
}
