'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Task } from '@/types';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import DueDateDisplay from './DueDateDisplay';
import Avatar from '@/components/ui/Avatar';
import { Pencil, Trash2 } from 'lucide-react';

interface TaskRowProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export default function TaskRow({ task, onEdit, onDelete }: TaskRowProps) {
  const router = useRouter();

  return (
    <tr
      className="border-b border-[#e4e4e7] hover:bg-[#f4f4f5] cursor-pointer transition-colors"
      onClick={() => router.push(`/tasks/${task.id}`)}
    >
      <td className="py-3 px-4">
        <span className="text-sm font-medium text-[#1c1c1e] truncate block max-w-xs">
          {task.title}
        </span>
      </td>
      <td className="py-3 px-4">
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <Avatar
              src={task.assignee.avatar_url}
              name={task.assignee.name}
              size="sm"
            />
            <span className="text-sm text-[#52525b] hidden lg:inline">
              {task.assignee.name}
            </span>
          </div>
        ) : (
          <span className="text-sm text-[#a1a1aa]">Unassigned</span>
        )}
      </td>
      <td className="py-3 px-4">
        <PriorityBadge priority={task.priority} />
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={task.status} />
      </td>
      <td className="py-3 px-4">
        {task.due_date ? (
          <DueDateDisplay dueDate={task.due_date} compact />
        ) : (
          <span className="text-sm text-[#a1a1aa]">No due date</span>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(task);
            }}
            className="p-1.5 rounded-md text-[#a1a1aa] hover:text-[#7c3aed] hover:bg-[#f4f4f5] transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(task);
            }}
            className="p-1.5 rounded-md text-[#a1a1aa] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}
