'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DatePicker from '@/components/ui/DatePicker';
import Button from '@/components/ui/Button';
import CharCounter from '@/components/ui/CharCounter';
import { useUsers } from '@/hooks/useUsers';
import { api } from '@/lib/api';
import { Task } from '@/types';
import toast from 'react-hot-toast';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreated,
}: CreateTaskModalProps) {
  const { users } = useUsers();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [titleError, setTitleError] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setAssigneeId('');
    setTitleError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }

    if (description.length > 500) {
      toast.error('Description must be 500 characters or less');
      return;
    }

    setLoading(true);
    try {
      await api.post<Task>('/api/tasks', {
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate || null,
        priority,
        assignee_id: assigneeId || null,
      });

      toast.success('Task created successfully!');
      resetForm();
      onCreated();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...users.map((u) => ({ value: u.id, label: u.name })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Task" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="Enter task title..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError('');
          }}
          error={titleError}
          required
        />

        <div>
          <label className="block text-sm font-medium text-[#3f3f46] mb-1.5">
            Description
          </label>
          <textarea
            placeholder="Add a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border text-sm text-[#1c1c1e]
              bg-white placeholder:text-[#a1a1aa] resize-none
              border-[#e4e4e7] focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20
              outline-none transition-all duration-150"
          />
          <div className="mt-1 flex justify-end">
            <CharCounter current={description.length} max={500} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatePicker
            label="Due Date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Select
            label="Priority"
            options={priorityOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          />
        </div>

        <Select
          label="Assignee"
          options={assigneeOptions}
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
