// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Premium PayStore | Next.js E-Commerce & UddoktaPay',
  description: 'Experience instant checkouts with bKash, Rocket, Nagad, and more through UddoktaPay.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
