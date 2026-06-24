'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/browser';

export function LoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function goToDashboard() {
    window.location.assign('/dashboard');
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const usernameOrEmail = identifier.trim();

    if (usernameOrEmail.toLowerCase() === 'admin') {
      const response = await fetch('/api/auth/super-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameOrEmail, password }),
      });

      setLoading(false);
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error === 'invalid_credentials' ? 'Invalid login credentials' : 'Could not sign in.');
        return;
      }

      goToDashboard();
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: usernameOrEmail, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    goToDashboard();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">Email or username</Label>
        <Input id="email" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
