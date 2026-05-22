'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
        }

        // Wait for session to be established
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // The AuthProvider will handle syncing with the backend
          router.push('/dashboard');
        } else {
          // No session, redirect to login
          router.push('/');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#71717a]">Signing you in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
          <div className="w-10 h-10 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
