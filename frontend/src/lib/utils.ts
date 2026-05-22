import { formatDistanceToNow, differenceInDays, isToday, isPast, parseISO } from 'date-fns';

export function formatRelativeDate(date: string): string {
  try {
    return formatDistanceToNow(parseISO(date), { addSuffix: true });
  } catch {
    return date;
  }
}

export function getDueDateDisplay(dueDate: string): { text: string; isOverdue: boolean } {
  try {
    const due = parseISO(dueDate);

    if (isToday(due)) {
      return { text: 'Due today', isOverdue: false };
    }

    if (isPast(due)) {
      const days = Math.abs(differenceInDays(new Date(), due));
      return {
        text: `Overdue by ${days} day${days !== 1 ? 's' : ''}`,
        isOverdue: true,
      };
    }

    const days = differenceInDays(due, new Date());
    if (days === 1) {
      return { text: 'Due tomorrow', isOverdue: false };
    }
    return { text: `Due in ${days} days`, isOverdue: false };
  } catch {
    return { text: dueDate, isOverdue: false };
  }
}

export function getPriorityConfig(priority: string): {
  label: string;
  bgColor: string;
  textColor: string;
} {
  switch (priority) {
    case 'high':
      return { label: 'High', bgColor: '#fef2f2', textColor: '#dc2626' };
    case 'medium':
      return { label: 'Medium', bgColor: '#fffbeb', textColor: '#d97706' };
    case 'low':
      return { label: 'Low', bgColor: '#f0fdf4', textColor: '#16a34a' };
    default:
      return { label: priority, bgColor: '#f4f4f5', textColor: '#71717a' };
  }
}

export function getStatusConfig(status: string): {
  label: string;
  bgColor: string;
  textColor: string;
} {
  switch (status) {
    case 'todo':
      return { label: 'Todo', bgColor: '#f4f4f5', textColor: '#52525b' };
    case 'in_progress':
      return { label: 'In Progress', bgColor: '#fffbeb', textColor: '#d97706' };
    case 'completed':
      return { label: 'Completed', bgColor: '#f0fdf4', textColor: '#16a34a' };
    default:
      return { label: status, bgColor: '#f4f4f5', textColor: '#71717a' };
  }
}

export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
