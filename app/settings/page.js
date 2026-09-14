'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Settings() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || '');
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    setError('');
    setMessage('');

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error.message);
      return;
    }

    window.location.href = '/login';
  };

  const sendPasswordReset = async () => {
    setError('');
    setMessage('');

    if (!email) {
      setError('No email address found.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset email sent. Check your inbox.');
    }
  };

  return (
    <main
      style={{
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      <h1>Settings</h1>
      <p>Manage your SupplierHub account settings.</p>

      {loading ? (
        <p>Loading settings...</p>
      ) : (
        <>
          <section
            style={{
              marginTop: '30px',
              padding: '25px',
              border: '1px solid #ddd',
              borderRadius: '12px',
            }}
          >
            <h2>Account</h2>

            <p>
              <strong>Email</strong>
            </p>

            <div
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            >
              {email || 'No email found'}
            </div>

            <button
              onClick={sendPasswordReset}
              style={{
                padding: '12px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Reset Password
            </button>
          </section>

          <section
            style={{
              marginTop: '25px',
              padding: '25px',
              border: '1px solid #ddd',
              borderRadius: '12px',
            }}
          >
            <h2>Session</h2>

            <p>You are currently logged in to SupplierHub.</p>

            <button
              onClick={handleLogout}
              style={{
                padding: '12px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </section>

          {message && (
            <p style={{ marginTop: '20px' }}>
              {message}
            </p>
          )}

          {error && (
            <p style={{ marginTop: '20px', color: 'red' }}>
              {error}
            </p>
          )}
        </>
      )}
    </main>
  );
    }
