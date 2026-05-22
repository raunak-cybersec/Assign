'use client';

import React from 'react';
import Image from 'next/image';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-14 h-14', text: 'text-lg' },
};

const pixelSizes = {
  sm: 32,
  md: 40,
  lg: 56,
};

export default function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const { container, text } = sizeMap[size];
  const initials = getInitials(name);

  if (src) {
    return (
      <div
        className={`${container} rounded-full overflow-hidden flex-shrink-0 ${className}`}
      >
        <Image
          src={src}
          alt={name}
          width={pixelSizes[size]}
          height={pixelSizes[size]}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div
      className={`${container} rounded-full bg-[#7c3aed] flex items-center justify-center flex-shrink-0 ${className}`}
    >
      <span className={`${text} font-medium text-white leading-none`}>
        {initials}
      </span>
    </div>
  );
}
