'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Task, ActivityLog } from '@/types';
import { api } from '@/lib/api';
import { formatRelativeDate } from '@/lib/utils';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import DueDateDisplay from './DueDateDisplay';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface TaskDetailViewProps {
  task: Task;
  activityLogs: ActivityLog[];
  onRefresh: () => void;
}

export default function TaskDetailView({
  task,
  activityLogs,
  onRefresh,
}: TaskDetailViewProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/tasks/${task.id}`);
      toast.success('Task deleted');
      router.push('/tasks');
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.put(`/api/tasks/${task.id}`, { status: newStatus });
      toast.success('Status updated');
      setEditingStatus(false);
      onRefresh();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      await api.put(`/api/tasks/${task.id}`, { priority: newPriority });
      toast.success('Priority updated');
      setEditingPriority(false);
      onRefresh();
    } catch {
      toast.error('Failed to update priority');
    }
  };

  const statusOptions = [
    { value: 'todo', label: 'Todo' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[#71717a] hover:text-[#1c1c1e] transition-colors mb-5"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.04)] p-6 mb-5">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#1c1c1e] flex-1 mr-4">
            {task.title}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/tasks`)}
            >
              <Pencil size={14} className="mr-1.5" />
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 size={14} className="mr-1.5" />
              Delete
            </Button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
              Status
            </label>
            {editingStatus ? (
              <Select
                options={statusOptions}
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                onBlur={() => setEditingStatus(false)}
              />
            ) : (
              <div
                className="cursor-pointer"
                onClick={() => setEditingStatus(true)}
              >
                <StatusBadge status={task.status} />
              </div>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
              Priority
            </label>
            {editingPriority ? (
              <Select
                options={priorityOptions}
                value={task.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                onBlur={() => setEditingPriority(false)}
              />
            ) : (
              <div
                className="cursor-pointer"
                onClick={() => setEditingPriority(true)}
              >
                <PriorityBadge priority={task.priority} />
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
              Due Date
            </label>
            {task.due_date ? (
              <DueDateDisplay dueDate={task.due_date} />
            ) : (
              <span className="text-sm text-[#a1a1aa]">No due date</span>
            )}
          </div>

          {/* Creator */}
          <div>
            <label className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
              Creator
            </label>
            {task.creator ? (
              <div className="flex items-center gap-2">
                <Avatar
                  src={task.creator.avatar_url}
                  name={task.creator.name}
                  size="sm"
                />
                <span className="text-sm text-[#1c1c1e]">
                  {task.creator.name}
                </span>
              </div>
            ) : (
              <span className="text-sm text-[#a1a1aa]">Unknown</span>
            )}
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1.5">
              Assignee
            </label>
            {task.assignee ? (
              <div className="flex items-center gap-2">
                <Avatar
                  src={task.assignee.avatar_url}
                  name={task.assignee.name}
                  size="sm"
                />
                <span className="text-sm text-[#1c1c1e]">
                  {task.assignee.name}
                </span>
              </div>
            ) : (
              <span className="text-sm text-[#a1a1aa]">Unassigned</span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.04)] p-6 mb-5">
          <h3 className="text-sm font-semibold text-[#1c1c1e] mb-3">Description</h3>
          <p className="text-sm text-[#52525b] leading-relaxed whitespace-pre-wrap">
            {task.description}
          </p>
        </div>
      )}

      {/* Activity Log */}
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.04)] p-6">
        <h3 className="text-sm font-semibold text-[#1c1c1e] mb-4">Activity</h3>
        {activityLogs.length > 0 ? (
          <div className="space-y-4">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Avatar
                    src={log.user?.avatar_url}
                    name={log.user?.name || 'User'}
                    size="sm"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#52525b]">
                    <span className="font-medium text-[#1c1c1e]">
                      {log.user?.name || 'Someone'}
                    </span>{' '}
                    {log.action}
                    {log.old_value && log.new_value && (
                      <>
                        {' '}
                        from{' '}
                        <span className="font-medium">{log.old_value}</span> to{' '}
                        <span className="font-medium">{log.new_value}</span>
                      </>
                    )}
                  </p>
                  <span className="text-xs text-[#a1a1aa]">
                    {formatRelativeDate(log.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#a1a1aa]">No activity yet</p>
        )}
      </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="This task will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </motion.div>
  );
}
