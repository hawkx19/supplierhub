'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function Signup() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setMessage('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          business_name: businessName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push('/dashboard');
      return;
    }

    setMessage(
      'Account created! Check your email to confirm your account.'
    );

    setLoading(false);
  };

  return (
    <main className="auth-page">
      <Link href="/" className="brand auth-brand">
        <span className="brand-dot" />
        Supplier<span>Hub</span>
      </Link>

      <div className="auth-card">
        <div className="eyebrow">EARLY ACCESS</div>

        <h1>Build your digital store.</h1>

        <p>
          Set up your supplier hub and start sharing your catalog.
        </p>

        <form onSubmit={handleSignup}>
          <label>
            Business name
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Sharma Electricals"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              minLength={6}
              required
            />
          </label>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-success">
              {message}
            </div>
          )}

          <button
            className="button primary"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating store...' : 'Create store →'}
          </button>
        </form>

        <small>
          Already have an account?{' '}
          <Link href="/login">Sign in</Link>
        </small>
      </div>
    </main>
  );
}
