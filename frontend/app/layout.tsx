'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Auth0Provider } from '@auth0/nextjs-auth0';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <Auth0Provider>{children}</Auth0Provider>
      </body>
    </html>
  );
}