import Image from 'next/image';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--brand-dark)' }}
    >
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8 shadow-lg">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/brand/itdev-logo-dark.svg"
            alt="IT DEV"
            width={160}
            height={33}
            priority
          />
          <div className="text-center">
            <h1 className="text-xl font-semibold">Client Intake</h1>
            <p className="text-sm text-muted-foreground">Sign in to the dashboard</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
