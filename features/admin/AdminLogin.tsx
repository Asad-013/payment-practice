// features/admin/AdminLogin.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      setErrorMsg('Supabase client is not initialized. Please restart your Next.js dev server to load environment variables.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        // Set the token as a cookie matching verifyAdminAuth format so Server Actions can read it
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const projectId = supabaseUrl.match(/https:\/\/(.*?)\.supabase\.co/)?.[1];
        
        if (projectId) {
          const expires = new Date(Date.now() + data.session.expires_in * 1000).toUTCString();
          document.cookie = `sb-${projectId}-auth-token=${JSON.stringify(data.session)}; path=/; expires=${expires}; SameSite=Lax; Secure`;
        }

        router.push('/admin/dashboard');
      } else {
        setErrorMsg('Authentication failed.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Invalid credentials or connection error.');
    } finally {
      setLoading(false);
    }
  };

  const isSupabaseConfigured = !!supabase;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '2rem',
    }}>
      <Card style={{
        maxWidth: '400px',
        width: '100%',
        padding: '2.5rem',
      }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>Admin Access</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Enter administrator credentials to manage products.
        </p>

        {!isSupabaseConfigured && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--danger-accent)',
            color: 'var(--danger-accent)',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
          }}>
            <strong>Environment Configuration Required:</strong> Next.js needs to reload your environment variables. Please restart your dev server (Ctrl+C and run <code>npm run dev</code>).
          </div>
        )}

        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--danger-accent)',
            color: 'var(--danger-accent)',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="checkout-form">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@store.com"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" style={{ marginTop: '1.5rem', width: '100%', padding: '0.9rem' }} isLoading={loading}>
            Sign In
          </Button>
        </form>
      </Card>
    </div>
  );
}
