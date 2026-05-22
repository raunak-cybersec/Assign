'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
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
    <div className="flex flex-col h-full w-64 bg-[#1c1c1e] text-white">
      {/* Logo */}
      <div className="px-5 pt-6 pb-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5"
          onClick={handleNavClick}
        >
          <div className="w-8 h-8 rounded-lg bg-[#7c3aed] flex items-center justify-center">
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
              <motion.div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-[#a1a1aa] hover:bg-white/5 hover:text-white'
                }`}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
              >
                <Icon size={18} />
                {item.label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      {user && (
        <div className="px-3 pb-4 mt-auto">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/5">
            <Avatar
              src={user.avatar_url}
              name={user.name}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-[#71717a] truncate">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="p-1.5 rounded-md text-[#71717a] hover:text-white hover:bg-white/10 transition-colors"
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
