import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Client Intake — Agency Dashboard',
  description: 'Internal dashboard for client onboarding.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
