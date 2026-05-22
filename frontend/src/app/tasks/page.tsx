'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import TaskTable from '@/components/tasks/TaskTable';
import TaskFilters from '@/components/tasks/TaskFilters';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import { useTasks } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/hooks/useAuth';
import { Task } from '@/types';
import { api } from '@/lib/api';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TaskListPage() {
  const { user } = useAuth();
  const { tasks, loading, refetch } = useTasks();
  const { users } = useUsers();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [createdByMe, setCreatedByMe] = useState(false);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (assigneeFilter) {
      result = result.filter((t) => t.assignee_id === assigneeFilter);
    }
    if (priorityFilter) {
      result = result.filter((t) => t.priority === priorityFilter);
    }
    if (statusFilter) {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (assignedToMe && user) {
      result = result.filter((t) => t.assignee_id === user.id);
    }
    if (createdByMe && user) {
      result = result.filter((t) => t.creator_id === user.id);
    }

    return result;
  }, [tasks, assigneeFilter, priorityFilter, statusFilter, assignedToMe, createdByMe, user]);

  const handleDelete = useCallback(async () => {
    if (!deleteTask) return;
    setDeleting(true);
    try {
      await api.delete(`/api/tasks/${deleteTask.id}`);
      toast.success('Task deleted');
      setDeleteTask(null);
      refetch();
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(false);
    }
  }, [deleteTask, refetch]);

  return (
    <AppLayout title="Tasks">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm text-[#71717a]">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} className="mr-1.5" />
            Create Task
          </Button>
        </div>

        {/* Filters */}
        <TaskFilters
          assigneeFilter={assigneeFilter}
          priorityFilter={priorityFilter}
          statusFilter={statusFilter}
          assignedToMe={assignedToMe}
          createdByMe={createdByMe}
          users={users}
          onAssigneeChange={setAssigneeFilter}
          onPriorityChange={setPriorityFilter}
          onStatusChange={setStatusFilter}
          onAssignedToMeToggle={() => setAssignedToMe(!assignedToMe)}
          onCreatedByMeToggle={() => setCreatedByMe(!createdByMe)}
        />

        {/* Table */}
        <TaskTable
          tasks={filteredTasks}
          loading={loading}
          onDelete={(task) => setDeleteTask(task)}
          onCreateTask={() => setCreateModalOpen(true)}
        />

        {/* Create Modal */}
        <CreateTaskModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreated={refetch}
        />

        {/* Delete Confirm */}
        <ConfirmDialog
          isOpen={!!deleteTask}
          onClose={() => setDeleteTask(null)}
          onConfirm={handleDelete}
          title="Delete Task"
          message={`Are you sure you want to delete "${deleteTask?.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          loading={deleting}
        />
      </motion.div>
    </AppLayout>
  );
}
