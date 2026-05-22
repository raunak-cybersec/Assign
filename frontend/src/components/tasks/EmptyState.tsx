'use client';

import React from 'react';
import { ClipboardList } from 'lucide-react';
import Button from '@/components/ui/Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title = 'No tasks yet',
  description = 'Create your first task to get started!',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-[#f4f4f5] flex items-center justify-center mb-4">
        <ClipboardList size={28} className="text-[#a1a1aa]" />
      </div>
      <h3 className="text-lg font-semibold text-[#1c1c1e] mb-1">{title}</h3>
      <p className="text-sm text-[#71717a] text-center max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
