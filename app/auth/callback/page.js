'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');

      if (!code) {
        setError('Verification link is invalid or expired.');
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setError(error.message);
        return;
      }

      router.replace('/dashboard');
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <h1>Verification failed</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Verifying your account...</h1>
        <p>Please wait, logging you in.</p>
      </div>
    </main>
  );
}
