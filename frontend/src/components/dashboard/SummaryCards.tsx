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
      gradient: 'from-[#ede9fe] to-[#ddd6fe]',
      iconBg: 'bg-[#7c3aed]',
      iconColor: 'text-white',
      countColor: 'text-[#5b21b6]',
    },
    {
      label: 'Todo',
      count: todoCount,
      icon: ListTodo,
      gradient: 'from-[#f1f5f9] to-[#e2e8f0]',
      iconBg: 'bg-[#475569]',
      iconColor: 'text-white',
      countColor: 'text-[#334155]',
    },
    {
      label: 'In Progress',
      count: inProgressCount,
      icon: Timer,
      gradient: 'from-[#fef9c3] to-[#fef08a]',
      iconBg: 'bg-[#ca8a04]',
      iconColor: 'text-white',
      countColor: 'text-[#854d0e]',
    },
    {
      label: 'Completed',
      count: completedCount,
      icon: CheckCircle2,
      gradient: 'from-[#dcfce7] to-[#bbf7d0]',
      iconBg: 'bg-[#16a34a]',
      iconColor: 'text-white',
      countColor: 'text-[#166534]',
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
            className={`bg-gradient-to-br ${card.gradient} rounded-xl p-5 border border-white/60 shadow-sm hover:shadow-md transition-shadow duration-200`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
                {card.label}
              </span>
              <div
                className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center shadow-sm`}
              >
                <Icon size={16} className={card.iconColor} />
              </div>
            </div>
            <span className={`text-2xl font-bold ${card.countColor}`}>
              {card.count}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
