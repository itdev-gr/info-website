import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IT DEV — Client Intake',
  description: 'Client onboarding dashboard for IT DEV agency.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
