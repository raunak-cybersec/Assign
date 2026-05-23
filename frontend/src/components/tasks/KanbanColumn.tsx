'use client';

import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Task } from '@/types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  bgColor: string;
  tasks: Task[];
}

const columnStyles: Record<string, { bg: string; border: string; badge: string; badgeText: string }> = {
  todo: {
    bg: 'bg-gradient-to-b from-[#f1f5f9] to-[#e8ecf1]',
    border: 'border-[#cbd5e1]',
    badge: 'bg-[#475569]',
    badgeText: 'text-white',
  },
  in_progress: {
    bg: 'bg-gradient-to-b from-[#fef9c3] to-[#fef3c7]',
    border: 'border-[#fbbf24]',
    badge: 'bg-[#d97706]',
    badgeText: 'text-white',
  },
  completed: {
    bg: 'bg-gradient-to-b from-[#dcfce7] to-[#d1fae5]',
    border: 'border-[#86efac]',
    badge: 'bg-[#16a34a]',
    badgeText: 'text-white',
  },
};

export default function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
  const style = columnStyles[id] || columnStyles.todo;

  return (
    <div className={`${style.bg} rounded-xl p-4 border ${style.border}/40 min-h-[400px]`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#1c1c1e]">{title}</h3>
        <span className={`${style.badge} ${style.badgeText} text-xs font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center`}>
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-2.5 min-h-[100px] rounded-lg transition-colors duration-200 ${
              snapshot.isDraggingOver ? 'bg-white/40 ring-2 ring-[#7c3aed]/20 p-2' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskCard task={task} index={index} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
