'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '@/components/layout/AppLayout';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import Button from '@/components/ui/Button';
import { useTasks } from '@/hooks/useTasks';
import { Plus } from 'lucide-react';

export default function TaskBoardPage() {
  const { tasks, loading, refetch, updateTaskStatus } = useTasks();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <AppLayout title="Task Board">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-[#71717a]">
            Drag and drop tasks between columns to update status
          </p>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} className="mr-1.5" />
            Create Task
          </Button>
        </div>

        {/* Kanban Board */}
        <KanbanBoard
          tasks={tasks}
          loading={loading}
          onStatusChange={updateTaskStatus}
          onCreateTask={() => setCreateModalOpen(true)}
        />

        {/* Create Modal */}
        <CreateTaskModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreated={refetch}
        />
      </motion.div>
    </AppLayout>
  );
}
