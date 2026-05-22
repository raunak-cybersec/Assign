'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Task } from '@/types';

interface UseTasksOptions {
  status?: string;
  priority?: string;
  assignee_id?: string;
  creator_id?: string;
}

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateTaskStatus: (taskId: string, newStatus: Task['status']) => Promise<void>;
}

export function useTasks(options?: UseTasksOptions): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options?.status) params.set('status', options.status);
      if (options?.priority) params.set('priority', options.priority);
      if (options?.assignee_id) params.set('assignee_id', options.assignee_id);
      if (options?.creator_id) params.set('creator_id', options.creator_id);

      const query = params.toString();
      const path = `/api/tasks${query ? `?${query}` : ''}`;
      const data = await api.get<{ tasks: Task[] }>(path);
      setTasks(data.tasks || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(message);
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [options?.status, options?.priority, options?.assignee_id, options?.creator_id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      await api.put(`/api/tasks/${taskId}`, { status: newStatus });
      await fetchTasks();
    } catch (err) {
      console.error('Failed to update task status:', err);
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    updateTaskStatus,
  };
}
