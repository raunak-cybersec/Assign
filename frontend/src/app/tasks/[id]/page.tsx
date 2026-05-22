'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import TaskDetailView from '@/components/tasks/TaskDetailView';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { Task, ActivityLog } from '@/types';

interface TaskDetailResponse {
  task: Task;
  activity_logs: ActivityLog[];
}

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchTask = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<TaskDetailResponse>(`/api/tasks/${taskId}`);
      if (data.task) {
        setTask(data.task);
        setActivityLogs(data.activity_logs || []);
      } else {
        // API might return task directly without wrapper
        const taskData = data as unknown as Task;
        setTask(taskData);
        // Try to fetch activity logs separately
        try {
          const logs = await api.get<ActivityLog[]>(`/api/tasks/${taskId}/activity`);
          setActivityLogs(logs);
        } catch {
          setActivityLogs([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch task:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId, fetchTask]);

  if (loading) {
    return (
      <AppLayout title="Loading...">
        <div className="space-y-5">
          <Skeleton className="h-4 w-16" />
          <div className="bg-white rounded-xl shadow-card p-6 space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-card p-6">
            <SkeletonText lines={3} />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (notFound || !task) {
    return (
      <AppLayout title="Not Found">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <p className="text-6xl font-bold text-[#e4e4e7] mb-4">404</p>
          <h2 className="text-xl font-semibold text-[#1c1c1e] mb-2">
            Task not found
          </h2>
          <p className="text-sm text-[#71717a] mb-6">
            The task you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <a
            href="/tasks"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors"
          >
            Back to Tasks
          </a>
        </motion.div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={task.title}>
      <TaskDetailView
        task={task}
        activityLogs={activityLogs}
        onRefresh={fetchTask}
      />
    </AppLayout>
  );
}
