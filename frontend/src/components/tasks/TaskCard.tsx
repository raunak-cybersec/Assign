'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Task } from '@/types';
import PriorityBadge from './PriorityBadge';
import DueDateDisplay from './DueDateDisplay';
import Avatar from '@/components/ui/Avatar';

interface TaskCardProps {
  task: Task;
  index: number;
}

export default function TaskCard({ task, index }: TaskCardProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      onClick={() => router.push(`/tasks/${task.id}`)}
      className="bg-white rounded-lg p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.04)]
        cursor-pointer hover:bg-[#f4f4f5] transition-colors duration-150 group"
    >
      <h4 className="text-sm font-medium text-[#1c1c1e] mb-2 truncate group-hover:text-[#7c3aed] transition-colors">
        {task.title}
      </h4>
      <div className="flex items-center gap-2 mb-3">
        <PriorityBadge priority={task.priority} />
        {task.due_date && <DueDateDisplay dueDate={task.due_date} compact />}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#a1a1aa]">
          {task.status === 'todo' ? 'Todo' : task.status === 'in_progress' ? 'In Progress' : 'Completed'}
        </span>
        {task.assignee && (
          <Avatar
            src={task.assignee.avatar_url}
            name={task.assignee.name}
            size="sm"
          />
        )}
      </div>
    </motion.div>
  );
}
