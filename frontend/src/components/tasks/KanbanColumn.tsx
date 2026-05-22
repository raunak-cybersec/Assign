'use client';

import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Task } from '@/types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  bgColor: string;
}

export default function KanbanColumn({ id, title, tasks, bgColor }: KanbanColumnProps) {
  return (
    <div className="flex flex-col rounded-xl min-h-[400px]" style={{ backgroundColor: bgColor }}>
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-[#1c1c1e]">{title}</h3>
        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#e4e4e7] text-[#52525b] text-xs font-medium">
          {tasks.length}
        </span>
      </div>
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 px-3 pb-3 space-y-2.5 transition-colors duration-200 rounded-b-xl ${
              snapshot.isDraggingOver ? 'bg-[#7c3aed]/5' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    className={`${dragSnapshot.isDragging ? 'rotate-2 scale-105' : ''} transition-transform`}
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
