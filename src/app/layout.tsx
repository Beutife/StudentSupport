import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '../../src/lib/components/providers/Providers'
//import { OpenfortButton } from '@openfort/react';
// Load Inter font
const inter = Inter({ subsets: ['latin'] });

// Page metadata (shows in browser tab)
export const metadata: Metadata = {
  title: 'StudentSupport - Sponsor Students',
  description: 'Help Nigerian students stay in school with crypto subscriptions',
};

// Root layout wraps EVERY page
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap everything in Providers */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}