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

### `autoConvert`

Opt-in automatic form-submit capture. When enabled, the script listens for form submissions and fires a lead conversion event without any custom JavaScript. Requires a `publishableKey` to be set.

```tsx
<CodeQRAnalytics
  publishableKey="pk_live_..."
  autoConvert={{ forms: true }}
/>
```

#### Opting in per-form

By default, automatic capture is **off** for every form. To enable it, either:

- Add a `data-codeqr-conversion` attribute to the specific `<form>` element you want to capture, **or**
- Pass a CSS selector via `autoConvert.formSelector` (e.g. `formSelector: "form.contact-form"`) to allowlist matching forms globally.

Forms that match neither criterion are ignored.

#### Opting out per-form

To exclude a specific form even when it would otherwise be captured (e.g. because it matches `autoConvert.formSelector`), add `data-codeqr-ignore` to the `<form>` element:

```html
<form data-codeqr-ignore>...</form>
```

#### Default fields captured

By default, only identity fields are captured: **email**, **name** (first/last/full), and **phone**. The email address is used as the `externalId` for deduplication; when no email or phone is present, an anonymous identifier is generated.

#### Capturing additional metadata

To include extra form fields as conversion metadata:

- Set `autoConvert.captureAllFields: true` to capture all non-sensitive fields from every matched form, **or**
- Add `data-codeqr-capture` to individual `<input>` / `<select>` / `<textarea>` elements to opt those fields in:

```html
<form data-codeqr-conversion>
  <input name="email" type="email" />
  <input name="company" type="text" data-codeqr-capture />
</form>
```

#### Always-excluded fields

The following are **never** captured regardless of any configuration or attribute:

- `type="password"`, `type="hidden"`, `type="file"`
- Credit-card patterns (fields whose name contains `card`, `cvv`, `cvc`, `ccv`, or `expir`)
- OTP/verification-code patterns (fields whose name contains `otp`, `token`, or `verification`)

#### Consent

Load the analytics snippet **after** the user has given consent (e.g. inside your cookie-consent callback). Automatic form capture only activates once the script is present on the page — deferring the script load is the recommended way to honour consent requirements.