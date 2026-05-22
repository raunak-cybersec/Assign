'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import SummaryCards from '@/components/dashboard/SummaryCards';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/types';

/** Derive "activity" from tasks to show on the dashboard. */
function deriveActivities(tasks: Task[]) {
  return tasks
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10)
    .map((task) => ({
      id: `activity-${task.id}`,
      task_id: task.id,
      user_id: task.creator_id,
      user: task.creator || task.assignee,
      action: task.status === 'completed'
        ? `completed "${task.title}"`
        : task.status === 'in_progress'
          ? `started working on "${task.title}"`
          : `created "${task.title}"`,
      old_value: null,
      new_value: task.status,
      created_at: task.updated_at,
    }));
}

export default function DashboardPage() {
  const { tasks, loading: tasksLoading } = useTasks();
  const activities = deriveActivities(tasks);

  return (
    <AppLayout title="Dashboard">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Summary Cards */}
        {tasksLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <SummaryCards tasks={tasks} />
        )}

        {/* Activity Feed */}
        <ActivityFeed activities={activities} loading={tasksLoading} />
      </motion.div>
    </AppLayout>
  );
}
