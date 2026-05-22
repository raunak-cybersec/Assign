'use client';

import React from 'react';

interface CharCounterProps {
  current: number;
  max: number;
}

export default function CharCounter({ current, max }: CharCounterProps) {
  const isOver = current > max;

  return (
    <span
      className={`text-xs ${
        isOver ? 'text-[#dc2626] font-medium' : 'text-[#a1a1aa]'
      }`}
    >
      {current}/{max} characters
    </span>
  );
}
