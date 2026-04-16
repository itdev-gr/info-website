'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/browser';

export function LogoutButton() {
  const router = useRouter();

  async function onClick() {
    await createClient().auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick}>Log out</Button>
  );
}
