## Overview

`@codeqr/analytics` allows you to track leads and sales conversions for CodeQR.

## Quick start

  1. Enable conversion tracking for your CodeQR link.
  2. Install the `@codeqr/analytics` package to your project

  ```bash
  npm install @codeqr/analytics
  ```

  3. Inject the Analytics script to your app

  ```tsx
  import { Analytics as CodeQRAnalytics } from '@codeqr/analytics/react';

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <body>{children}</body>
        <CodeQRAnalytics />
      </html>
    );
  }
  ```
  
  You can all use the `inject()` function to add the tracking script to other frameworks.

## Available Props

You can pass the following props to the `Analytics` component to customize the tracking script.

### `apiHost`

The API host to use for tracking. This is useful for setting up reverse proxies to avoid adblockers. The default is `https://api.codeqr.io`.

### `domainsConfig`

This is a JSON object that configures the domains that CodeQR will track.

- `refer`: The CodeQR short domain for [referral program client-side click tracking](https://codeqr.link/clicks/refer) (previously `shortDomain`).
- `site`: The CodeQR short domain for [tracking site visits](https://codeqr.link/clicks/site).
- `outbound`: An array of domains for cross-domain tracking. When configured, the existing `cq_id` cookie will be automatically appended to all outbound links targeting these domains to enable cross-domain tracking across different applications.

### `shortDomain`

[DEPRECATED: use `domainsConfig.refer` instead] The custom short domain you're using on CodeQR for your short links (for client-side click tracking).

### `attributionModel`

Decide the attribution model to use for tracking. The default is `last-click`.

- `first-click` - The first click model gives all the credit to the first touchpoint in the customer journey.
- `last-click` - The last click model gives all the credit to the last touchpoint in the customer journey.

### `cookieOptions`

The `cookieOptions` prop accepts the following keys:

| Key   | Default | Description | Example |
|----------|---------|-------------|---------|
| `domain` | `null` | Specifies the value for the `Domain` Set-Cookie attribute. | `example.com` |
| `expires` | 90 days from now | Specifies the `Date` object to be the value for the `Expires` Set-Cookie attribute. | `new Date('2024-12-31')` |
| `expiresInDays` | `90` | Specifies the number (in days) to be the value for the `Expires` Set-Cookie attribute. | `90` |
| `path` | `/` | Specifies the value for the `Path` Set-Cookie attribute. By default, the path is considered the "default path". | `/` |

For example, to set a 60-day cookie window, you can use the following code:

```tsx
import { Analytics as CodeQRAnalytics } from "@codeqr/analytics"

<CodeQRAnalytics
   cookieOptions={{
      expiresInDays: 60,
   }}
/>
```

### `queryParam`

The query parameter to listen to for client-side click-tracking (e.g. `?via=john`, `?ref=jane`). The default is `via`.

### `scriptProps`

Custom properties to pass to the script tag. Refer to [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement) for all available options.