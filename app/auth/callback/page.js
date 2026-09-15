'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const hashParams = new URLSearchParams(
        window.location.hash.substring(1)
      );

      const queryParams = new URLSearchParams(window.location.search);

      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const code = queryParams.get('code');

      // PKCE / code flow
      if (code) {
        const { error } =
          await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setError(error.message);
          return;
        }

        router.replace('/dashboard');
        return;
      }

      // Supabase hash / implicit flow
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
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
