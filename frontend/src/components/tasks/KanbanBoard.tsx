'use client';

import React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Task } from '@/types';
import KanbanColumn from './KanbanColumn';
import { SkeletonKanbanColumn } from '@/components/ui/Skeleton';
import EmptyState from './EmptyState';
import toast from 'react-hot-toast';

interface KanbanBoardProps {
  tasks: Task[];
  loading: boolean;
  onStatusChange: (taskId: string, newStatus: Task['status']) => Promise<void>;
  onCreateTask?: () => void;
}

const columns = [
  { id: 'todo', title: 'Todo', bgColor: '#fafafa' },
  { id: 'in_progress', title: 'In Progress', bgColor: '#fefce8' },
  { id: 'completed', title: 'Completed', bgColor: '#f0fdf4' },
] as const;

export default function KanbanBoard({
  tasks,
  loading,
  onStatusChange,
  onCreateTask,
}: KanbanBoardProps) {
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as Task['status'];

    if (source.droppableId !== destination.droppableId) {
      try {
        await onStatusChange(draggableId, newStatus);
        const statusLabels: Record<string, string> = {
          todo: 'Todo',
          in_progress: 'In Progress',
          completed: 'Completed',
        };
        toast.success(`Task moved to ${statusLabels[newStatus]}`);
      } catch {
        toast.error('Failed to update task status');
      }
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {columns.map((col) => (
          <SkeletonKanbanColumn key={col.id} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks on the board"
        description="Create your first task to start organizing!"
        actionLabel="Create Task"
        onAction={onCreateTask}
      />
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            bgColor={col.bgColor}
            tasks={tasks.filter((t) => t.status === col.id)}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
