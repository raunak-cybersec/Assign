export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  creator_id: string;
  assignee_id: string | null;
  creator?: User;
  assignee?: User;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  task_id: string;
  user_id: string;
  user?: User;
  action: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  task_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
