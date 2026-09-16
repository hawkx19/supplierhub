'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Settings() {
  const [email, setEmail] = useState('');

  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [originalSlug, setOriginalSlug] = useState('');

  const [loading, setLoading] = useState(true);
  const [savingStore, setSavingStore] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      setError('');

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      setEmail(user.email || '');

      const { data, error } = await supabase
        .from('store_profiles')
        .select('store_slug, store_name')
        .eq('user_id', user.id)
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        setStoreName(data.store_name || '');
        setStoreSlug(data.store_slug || '');
        setOriginalSlug(data.store_slug || '');
      }

      setLoading(false);
    };

    loadSettings();
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

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/login`,
        }
      );

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        'Password reset email sent. Check your inbox.'
      );
    }
  };

  const saveStoreSettings = async () => {
    setError('');
    setMessage('');

    const cleanName = storeName.trim();

    const cleanSlug = storeSlug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!cleanName) {
      setError('Store name is required.');
      return;
    }

    if (!cleanSlug) {
      setError('Store slug is required.');
      return;
    }

    if (cleanSlug.length < 3) {
      setError(
        'Store slug must be at least 3 characters.'
      );
      return;
    }

    setSavingStore(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Please login again.');
      setSavingStore(false);
      return;
    }

    /*
      If slug is unchanged, only update the store name.
      If slug changed, first check whether another store
      is already using it.
    */

    if (cleanSlug !== originalSlug) {
      const { data: existingStore, error: slugCheckError } =
        await supabase
          .from('store_profiles')
          .select('user_id')
          .eq('store_slug', cleanSlug)
          .maybeSingle();

      if (slugCheckError) {
        setError(slugCheckError.message);
        setSavingStore(false);
        return;
      }

      if (
        existingStore &&
        existingStore.user_id !== user.id
      ) {
        setError(
          'This store link is already taken. Please choose another one.'
        );
        setSavingStore(false);
        return;
      }
    }

    const { error: updateError } = await supabase
      .from('store_profiles')
      .update({
        store_name: cleanName,
        store_slug: cleanSlug,
      })
      .eq('user_id', user.id);

    if (updateError) {
      if (
        updateError.code === '23505' ||
        updateError.message
          ?.toLowerCase()
          .includes('duplicate')
      ) {
        setError(
          'This store link is already taken. Please choose another one.'
        );
      } else {
        setError(updateError.message);
      }

      setSavingStore(false);
      return;
    }

    setStoreName(cleanName);
    setStoreSlug(cleanSlug);
    setOriginalSlug(cleanSlug);

    setMessage('Store settings saved successfully.');
    setSavingStore(false);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '1000px',
        margin: '0 auto',
        color: '#fff',
        background:
          'linear-gradient(135deg, #070b14 0%, #0d1424 50%, #111827 100%)',
      }}
    >
      <h1
        style={{
          fontSize: '38px',
          marginBottom: '8px',
        }}
      >
        Settings
      </h1>

      <p
        style={{
          color: '#9ca3af',
        }}
      >
        Manage your SupplierHub account and store.
      </p>

      {loading ? (
        <p
          style={{
            marginTop: '30px',
            color: '#9ca3af',
          }}
        >
          Loading settings...
        </p>
      ) : (
        <>
          {/* =========================
              STORE SETTINGS
          ========================= */}

          <section
            style={{
              marginTop: '30px',
              padding: '25px',
              borderRadius: '16px',
              background:
                'rgba(17, 24, 39, 0.8)',
              border:
                '1px solid rgba(255,255,255,0.08)',
              boxShadow:
                '0 15px 40px rgba(0,0,0,.22)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: '6px',
              }}
            >
              Store Settings
            </h2>

            <p
              style={{
                color: '#9ca3af',
                marginBottom: '25px',
              }}
            >
              Customize your public SupplierHub store.
            </p>

            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
              }}
            >
              Store Name
            </label>

            <input
              value={storeName}
              onChange={(e) =>
                setStoreName(e.target.value)
              }
              placeholder="Enter your store name"
              style={inputStyle}
            />

            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
              }}
            >
              Store URL
            </label>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  color: '#9ca3af',
                  fontSize: '14px',
                }}
              >
                {typeof window !== 'undefined'
                  ? window.location.origin
                  : ''}
                /store/
              </span>

              <input
                value={storeSlug}
                onChange={(e) =>
                  setStoreSlug(e.target.value)
                }
                placeholder="your-store"
                style={{
                  ...inputStyle,
                  flex: 1,
                  minWidth: '180px',
                  marginBottom: 0,
                }}
              />
            </div>

            <p
              style={{
                color: '#6b7280',
                fontSize: '13px',
                marginBottom: '20px',
              }}
            >
              Use letters, numbers and hyphens for your
              store link.
            </p>

            <button
              onClick={saveStoreSettings}
              disabled={savingStore}
              style={{
                padding: '12px 20px',
                borderRadius: '9px',
                border: 'none',
                background: savingStore
                  ? '#374151'
                  : '#2563eb',
                color: '#fff',
                fontWeight: '700',
                cursor: savingStore
                  ? 'wait'
                  : 'pointer',
              }}
            >
              {savingStore
                ? 'Saving...'
                : 'Save Store Settings'}
            </button>

            {storeSlug && (
              <a
                href={`/store/${storeSlug}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-block',
                  marginLeft: '12px',
                  padding: '12px 20px',
                  borderRadius: '9px',
                  border:
                    '1px solid #374151',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: '700',
                }}
              >
                Open Store ↗
              </a>
            )}
          </section>

          {/* =========================
              ACCOUNT
          ========================= */}

          <section
            style={{
              marginTop: '25px',
              padding: '25px',
              borderRadius: '16px',
              background:
                'rgba(17, 24, 39, 0.8)',
              border:
                '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h2>Account</h2>

            <p>
              <strong>Email</strong>
            </p>

            <div
              style={{
                padding: '12px',
                border:
                  '1px solid #374151',
                borderRadius: '8px',
                marginBottom: '20px',
                background: '#0b1220',
                color: '#d1d5db',
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
                fontWeight: '700',
              }}
            >
              Reset Password
            </button>
          </section>

          {/* =========================
              SESSION
          ========================= */}

          <section
            style={{
              marginTop: '25px',
              padding: '25px',
              borderRadius: '16px',
              background:
                'rgba(17, 24, 39, 0.8)',
              border:
                '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <h2>Session</h2>

            <p
              style={{
                color: '#9ca3af',
              }}
            >
              You are currently logged in to SupplierHub.
            </p>

            <button
              onClick={handleLogout}
              style={{
                padding: '12px 18px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '700',
              }}
            >
              Logout
            </button>
          </section>

          {/* =========================
              MESSAGES
          ========================= */}

          {message && (
            <div
              style={{
                marginTop: '20px',
                padding: '14px',
                borderRadius: '10px',
                background: '#12351f',
                border:
                  '1px solid #166534',
                color: '#86efac',
              }}
            >
              {message}
            </div>
          )}

          {error && (
            <div
              style={{
                marginTop: '20px',
                padding: '14px',
                borderRadius: '10px',
                background: '#3f1d1d',
                border:
                  '1px solid #7f1d1d',
                color: '#fecaca',
              }}
            >
              {error}
            </div>
          )}
        </>
      )}
    </main>
  );
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px 14px',
  marginBottom: '20px',
  borderRadius: '9px',
  border: '1px solid #374151',
  background: '#0b1220',
  color: '#fff',
  outline: 'none',
  fontSize: '15px',
};
