'use client';

import React, { createContext, useEffect, useState, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUserWithBackend = useCallback(async (s: Session) => {
    try {
      const supaUser = s.user;
      const userData = {
        id: supaUser.id,
        email: supaUser.email || '',
        name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email || '',
        avatar_url: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture || null,
      };

      const response = await api.post<{ user: User }>('/api/auth/register', userData);
      setUser(response.user);
    } catch (error) {
      console.error('Failed to sync user with backend:', error);
      const supaUser = s.user;
      setUser({
        id: supaUser.id,
        email: supaUser.email || '',
        name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email || '',
        avatar_url: supaUser.user_metadata?.avatar_url || supaUser.user_metadata?.picture || null,
        created_at: supaUser.created_at,
      });
    }
  }, []);

  // Warmup ping to prevent backend cold start lag on Render free tier
  useEffect(() => {
    fetch('https://assign-fma7.onrender.com/api/health').catch(() => {});
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);

        if (initialSession) {
          await syncUserWithBackend(initialSession);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        if (event === 'SIGNED_IN' && newSession) {
          await syncUserWithBackend(newSession);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [syncUserWithBackend]);

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
