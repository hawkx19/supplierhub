'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = new URLSearchParams(window.location.search).get('code');

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
  }, [router]);

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
