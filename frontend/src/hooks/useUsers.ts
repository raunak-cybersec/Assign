'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';

interface UseUsersReturn {
  users: User[];
  loading: boolean;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.get<{ users: User[] }>('/api/users');
        setUsers(data.users || []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading };
}
