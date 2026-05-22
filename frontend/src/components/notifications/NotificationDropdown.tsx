'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Notification } from '@/types';
import { formatRelativeDate } from '@/lib/utils';
import { Inbox } from 'lucide-react';

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => Promise<void>;
  onClose: () => void;
}

export default function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onClose,
}: NotificationDropdownProps) {
  const router = useRouter();

  const handleClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await onMarkAsRead(notification.id);
    }
    router.push(`/tasks/${notification.task_id}`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-[#e4e4e7] z-50"
    >
      <div className="px-4 py-3 border-b border-[#e4e4e7]">
        <h3 className="text-sm font-semibold text-[#1c1c1e]">Notifications</h3>
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.slice(0, 20).map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleClick(notification)}
              className={`w-full text-left px-4 py-3 hover:bg-[#f4f4f5] transition-colors border-b border-[#f4f4f5] last:border-0 ${
                !notification.is_read ? 'bg-[#faf5ff]' : ''
              }`}
            >
              <div className="flex gap-2">
                {!notification.is_read && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] mt-1.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1c1c1e] leading-snug line-clamp-2">
                    {notification.message}
                  </p>
                  <span className="text-xs text-[#a1a1aa] mt-0.5 block">
                    {formatRelativeDate(notification.created_at)}
                  </span>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Inbox size={24} className="text-[#d4d4d8] mb-2" />
            <p className="text-sm text-[#a1a1aa]">No notifications</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
