'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/types';
import { CheckCircle2, ListTodo, Timer, LayoutList } from 'lucide-react';

interface SummaryCardsProps {
  tasks: Task[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

export default function SummaryCards({ tasks }: SummaryCardsProps) {
  const totalTasks = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const cards = [
    {
      label: 'Total Tasks',
      count: totalTasks,
      icon: LayoutList,
      iconBg: 'bg-[#ede9fe]',
      iconColor: 'text-[#7c3aed]',
    },
    {
      label: 'Todo',
      count: todoCount,
      icon: ListTodo,
      iconBg: 'bg-[#f4f4f5]',
      iconColor: 'text-[#52525b]',
    },
    {
      label: 'In Progress',
      count: inProgressCount,
      icon: Timer,
      iconBg: 'bg-[#fef9c3]',
      iconColor: 'text-[#ca8a04]',
    },
    {
      label: 'Completed',
      count: completedCount,
      icon: CheckCircle2,
      iconBg: 'bg-[#dcfce7]',
      iconColor: 'text-[#16a34a]',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">
                {card.label}
              </span>
              <div
                className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}
              >
                <Icon size={16} className={card.iconColor} />
              </div>
            </div>
            <span className="text-2xl font-bold text-[#1c1c1e]">
              {card.count}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
