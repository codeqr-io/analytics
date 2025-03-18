# CodeQR Analytics with Client-side Click Tracking + Reverse Proxy

This example shows you how you can use the `@codeqr/analytics` package with:

- [Client-side click tracking](https://codeqr.io/docs/conversions/clicks/introduction#client-side-click-tracking) for tracking clicks with query parameters in lieu of short links
- A reverse proxy to avoid getting blocked by ad blockers

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
      <CodeQRAnalytics apiHost="/_proxy/codeqr" shortDomain="go.company.com" />
    </html>
  );
}
```