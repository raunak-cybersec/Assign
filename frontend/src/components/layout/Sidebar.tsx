'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  LayoutDashboard,
  Columns3,
  List,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/ui/Avatar';

interface SidebarProps {
  onClose?: () => void;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks/board', label: 'Task Board', icon: Columns3 },
  { href: '/tasks', label: 'Task List', icon: List },
];

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full w-64 bg-gradient-to-b from-[#1e1b4b] via-[#1a1642] to-[#0f172a] text-white">
      {/* Logo */}
      <div className="px-5 pt-6 pb-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5"
          onClick={handleNavClick}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center shadow-lg shadow-purple-500/30">
            <CheckCircle2 size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Assign</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === '/tasks' && pathname.startsWith('/tasks/') && !pathname.startsWith('/tasks/board'));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className="block relative"
            >
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-[#7c3aed]/30 to-[#6d28d9]/20 text-white shadow-sm shadow-purple-500/10'
                    : 'text-[#c4b5fd] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#8b5cf6] rounded-r-full"
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      {user && (
        <div className="px-3 pb-4 mt-auto">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/5 border border-white/5">
            <Avatar
              src={user.avatar_url}
              name={user.name}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-[#a5b4fc] truncate">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="p-1.5 rounded-md text-[#a5b4fc] hover:text-white hover:bg-white/10 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
