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
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
      >
        {children}
      </body>
      <CodeQRAnalytics
        publishableKey="cq_test_pk"
        domainsConfig={{
          refer: 'getacme.link',
          site: 'getacme.link',
          outbound: 'example.com,other.com,sub.example.com',
        }}
        autoConvert={{
          forms: true,
          formSelector: '.cq-autoform',
          eventName: 'Lead',
        }}
        scriptProps={{
          src: CODEQR_ANALYTICS_SCRIPT_URL,
        }}
      />
    </html>
  );
}
