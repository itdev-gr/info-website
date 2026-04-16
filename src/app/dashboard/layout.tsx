import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from './logout-button';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b" style={{ backgroundColor: 'var(--brand-dark)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/brand/itdev-logo-white.svg"
              alt="IT DEV"
              width={130}
              height={27}
              priority
            />
            <span className="hidden sm:inline text-sm text-white/70 border-l border-white/20 pl-3">
              Client Intake
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70">{user?.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
