'use client';

import React, { useState, useMemo } from 'react';
import { Task } from '@/types';
import TaskRow from './TaskRow';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { SkeletonRow } from '@/components/ui/Skeleton';
import EmptyState from './EmptyState';

interface TaskTableProps {
  tasks: Task[];
  loading: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onCreateTask?: () => void;
}

type SortKey = 'title' | 'priority' | 'status' | 'due_date';
type SortDir = 'asc' | 'desc';

const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
const statusOrder: Record<string, number> = { todo: 1, in_progress: 2, completed: 3 };

export default function TaskTable({
  tasks,
  loading,
  onEdit,
  onDelete,
  onCreateTask,
}: TaskTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('due_date');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      let cmp = 0;

      switch (sortKey) {
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'priority':
          cmp = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
          break;
        case 'status':
          cmp = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
          break;
        case 'due_date':
          if (!a.due_date && !b.due_date) cmp = 0;
          else if (!a.due_date) cmp = 1;
          else if (!b.due_date) cmp = -1;
          else cmp = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
      }

      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [tasks, sortKey, sortDir]);

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column)
      return <ChevronUp size={14} className="text-[#d4d4d8]" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={14} className="text-[#7c3aed]" />
    ) : (
      <ChevronDown size={14} className="text-[#7c3aed]" />
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-4 space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.04)]">
        <EmptyState
          title="No tasks found"
          description="Create a new task or adjust your filters."
          actionLabel="Create Task"
          onAction={onCreateTask}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e4e4e7] bg-[#fafafa]">
              <th
                className="py-3 px-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider cursor-pointer hover:text-[#1c1c1e] transition-colors"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1">
                  Title
                  <SortIcon column="title" />
                </div>
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider">
                Assignee
              </th>
              <th
                className="py-3 px-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider cursor-pointer hover:text-[#1c1c1e] transition-colors"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center gap-1">
                  Priority
                  <SortIcon column="priority" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider cursor-pointer hover:text-[#1c1c1e] transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  <SortIcon column="status" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider cursor-pointer hover:text-[#1c1c1e] transition-colors"
                onClick={() => handleSort('due_date')}
              >
                <div className="flex items-center gap-1">
                  Due Date
                  <SortIcon column="due_date" />
                </div>
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-[#71717a] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
