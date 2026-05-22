'use client';

import React from 'react';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { User } from '@/types';

interface TaskFiltersProps {
  assigneeFilter: string;
  priorityFilter: string;
  statusFilter: string;
  assignedToMe: boolean;
  createdByMe: boolean;
  users: User[];
  onAssigneeChange: (val: string) => void;
  onPriorityChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onAssignedToMeToggle: () => void;
  onCreatedByMeToggle: () => void;
}

export default function TaskFilters({
  assigneeFilter,
  priorityFilter,
  statusFilter,
  assignedToMe,
  createdByMe,
  users,
  onAssigneeChange,
  onPriorityChange,
  onStatusChange,
  onAssignedToMeToggle,
  onCreatedByMeToggle,
}: TaskFiltersProps) {
  const assigneeOptions = [
    { value: '', label: 'All Assignees' },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'todo', label: 'Todo' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.04)] p-4 mb-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-auto sm:min-w-[160px]">
          <Select
            label="Assignee"
            options={assigneeOptions}
            value={assigneeFilter}
            onChange={(e) => onAssigneeChange(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto sm:min-w-[140px]">
          <Select
            label="Priority"
            options={priorityOptions}
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto sm:min-w-[140px]">
          <Select
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto mt-1 sm:mt-0 sm:pb-0.5">
          <Button
            variant={assignedToMe ? 'primary' : 'secondary'}
            size="sm"
            onClick={onAssignedToMeToggle}
          >
            Assigned to me
          </Button>
          <Button
            variant={createdByMe ? 'primary' : 'secondary'}
            size="sm"
            onClick={onCreatedByMeToggle}
          >
            Created by me
          </Button>
        </div>
      </div>
    </div>
  );
}
