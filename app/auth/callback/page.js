'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);

      const code = params.get('code');
      const tokenHash = params.get('token_hash');
      const type = params.get('type');

      // PKCE/code verification flow
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setError(error.message);
          return;
        }

        router.replace('/dashboard');
        return;
      }

      // Email verification token flow
      if (tokenHash && type === 'signup') {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'signup',
        });

        if (error) {
          setError(error.message);
          return;
        }

        router.replace('/dashboard');
        return;
      }

      setError('Verification link is invalid or expired.');
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
