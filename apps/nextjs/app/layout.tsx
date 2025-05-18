import { Analytics as CodeQRAnalytics } from '@codeqr/analytics/react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CODEQR_ANALYTICS_SCRIPT_URL } from './constants';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CodeQR Analytics',
  description: 'CodeQR Analytics Example App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
      <CodeQRAnalytics
        domainsConfig={{
          refer: 'getacme.link',
          site: 'getacme.link',
          outbound: 'example.com,other.com,sub.example.com',
        }}
        scriptProps={{
          src: CODEQR_ANALYTICS_SCRIPT_URL,
        }}
      />
    </html>
  );
}
