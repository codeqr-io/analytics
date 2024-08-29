# CodeQR Analytics with Next.js

This example shows you how you can use the `@codeqr/analytics` package with Next.js.


```ts app/layout.tsx
import { Analytics as CodeQRAnalytics } from '@codeqr/analytics/react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
      <CodeQRAnalytics
        cookieOptions={{
          domain: '.example.com', // Cross-domain cookie sharing
        }}
      />
    </html>
  );
}
```