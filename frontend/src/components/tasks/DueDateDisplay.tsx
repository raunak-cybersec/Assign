'use client';

import React from 'react';
import { getDueDateDisplay } from '@/lib/utils';
import { Calendar, AlertCircle } from 'lucide-react';

interface DueDateDisplayProps {
  dueDate: string;
  compact?: boolean;
}

export default function DueDateDisplay({ dueDate, compact = false }: DueDateDisplayProps) {
  const { text, isOverdue } = getDueDateDisplay(dueDate);

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs ${
          isOverdue ? 'text-[#dc2626]' : 'text-[#71717a]'
        }`}
      >
        {isOverdue ? (
          <AlertCircle size={12} />
        ) : (
          <Calendar size={12} />
        )}
        {text}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isOverdue
          ? 'bg-[#fef2f2] text-[#dc2626]'
          : 'bg-[#f4f4f5] text-[#52525b]'
      }`}
    >
      {isOverdue ? (
        <AlertCircle size={13} />
      ) : (
        <Calendar size={13} />
      )}
      {text}
    </div>
  );
}
