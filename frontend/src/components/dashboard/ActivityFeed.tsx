'use client';

import React from 'react';
import { ActivityLog } from '@/types';
import { formatRelativeDate } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';

interface ActivityFeedProps {
  activities: ActivityLog[];
  loading?: boolean;
}

export default function ActivityFeed({ activities, loading }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#e2e0f0] shadow-sm p-6">
        <h3 className="text-sm font-semibold text-[#1c1c1e] mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-[#e4e4e7]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-[#e4e4e7] rounded w-3/4" />
                <div className="h-2.5 bg-[#e4e4e7] rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#e2e0f0] shadow-sm p-6">
      <h3 className="text-sm font-semibold text-[#1c1c1e] mb-4">Recent Activity</h3>
      {activities.length > 0 ? (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <Avatar
                src={activity.user?.avatar_url}
                name={activity.user?.name || 'User'}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#52525b] leading-snug">
                  <span className="font-medium text-[#1c1c1e]">
                    {activity.user?.name || 'Someone'}
                  </span>{' '}
                  {activity.action}
                  {activity.old_value && activity.new_value && (
                    <>
                      {' '}from{' '}
                      <span className="font-medium">{activity.old_value}</span>
                      {' '}to{' '}
                      <span className="font-medium">{activity.new_value}</span>
                    </>
                  )}
                </p>
                <span className="text-xs text-[#a1a1aa]">
                  {formatRelativeDate(activity.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-[#a1a1aa]">No recent activity</p>
        </div>
      )}
    </div>
  );
}
