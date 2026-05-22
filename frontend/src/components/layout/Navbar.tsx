'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';

interface NavbarProps {
  title: string;
  onMenuClick: () => void;
}

export default function Navbar({ title, onMenuClick }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#e4e4e7]">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-[#71717a] hover:text-[#1c1c1e] hover:bg-[#f4f4f5] transition-colors"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-[#1c1c1e]">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          {user && (
            <Avatar
              src={user.avatar_url}
              name={user.name}
              size="sm"
              className="hidden sm:flex"
            />
          )}
        </div>
      </div>
    </header>
  );
}
