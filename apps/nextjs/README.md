# CodeQR Analytics with Next.js

This example shows you how you can use the `@codeqr/analytics` package with Next.js, including the new conversion tracking features.

## Features

- **Conversion Tracking**: Test lead and sale conversion events with interactive forms
- **Outbound Link Tracking**: Test outbound domain tracking and parameter injection
- **Debug Information**: Real-time display of click IDs and configuration
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with Tailwind CSS for a clean, professional appearance

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Then visit [http://localhost:3000](http://localhost:3000) to see the app.

## Pages

### Home Page (`/`)
- Overview of available features
- Links to conversion tracking and outbound link testing

### Conversion Tracking Test (`/conversion-test`)
Interactive page to test the conversion tracking methods:

#### Features:
- **Debug Information**: Shows current click ID, API host, and configuration
- **Quick Tests**: One-click buttons to test lead and sale events
- **Lead Tracking Form**: Complete form to test lead events with custom data
- **Sale Tracking Form**: Complete form to test sale events with custom data
- **Real-time Results**: Shows API responses and error messages
- **Instructions**: Step-by-step guide on how to test

#### How to Test Conversion Tracking:

1. **Get a Click ID**: Visit a page with a CodeQR link or use the test link: `/?cq_id=test-click-id`
2. **Check Debug Info**: Verify that "Has Click ID" shows ✅ Yes
3. **Test Events**: Use the forms or quick test buttons to track events
4. **View Results**: Check the API response in the result section

### Outbound Links Test (`/outbound`)
Test outbound domain tracking and link parameter injection.

## Script Configuration

The app uses the complete script with all features:

```tsx
<CodeQRAnalytics
  domainsConfig={{
    refer: 'getacme.link',
    site: 'getacme.link',
    outbound: 'example.com,other.com,sub.example.com',
  }}
  scriptProps={{
    src: CODEQR_ANALYTICS_SCRIPT_URL.replace('script.js', 'script.site-visit.outbound-domains.conversion.js'),
  }}
/>
```

This includes:
- Site visit tracking
- Outbound domain tracking
- Conversion tracking methods

## Available Script Variants

The app demonstrates the complete script variant, but you can use any of these:

1. **`script.js`** - Base functionality only
2. **`script.site-visit.js`** - Base + site visit tracking
3. **`script.outbound-domains.js`** - Base + outbound domain tracking
4. **`script.site-visit.outbound-domains.js`** - Complete feature set
5. **`script.conversion.js`** - Base + conversion tracking
6. **`script.site-visit.conversion.js`** - Base + site visit + conversion tracking
7. **`script.outbound-domains.conversion.js`** - Base + outbound domains + conversion tracking
8. **`script.site-visit.outbound-domains.conversion.js`** - Complete feature set + conversion tracking

## Conversion Tracking Methods

The conversion tracking extension provides these methods:

### `CodeQRAnalytics.trackLead(eventData)`
Track lead events like sign-ups, form submissions, etc.

```javascript
await CodeQRAnalytics.trackLead({
  eventName: 'Newsletter Signup',
  customerId: 'user_123',
  customerEmail: 'user@example.com',
  customerName: 'John Doe',
  metadata: { source: 'website' }
});
```

### `CodeQRAnalytics.trackSale(eventData)`
Track sale events like purchases, subscriptions, etc.

```javascript
await CodeQRAnalytics.trackSale({
  customerId: 'user_123',
  amount: 2900, // $29.00 in cents
  paymentProcessor: 'stripe',
  eventName: 'Purchase',
  currency: 'usd'
});
```

### Utility Methods
- `CodeQRAnalytics.getClickId()` - Get current click ID
- `CodeQRAnalytics.hasClickId()` - Check if click ID exists
- `CodeQRAnalytics.getConfig()` - Get current configuration

## Testing

Run the test suite to verify everything works:

```bash
# Run all tests
pnpm test

# Run tests in debug mode
pnpm test:debug

# Run tests with UI
pnpm test:ui
```

## Environment Variables

Set up your environment variables in `.env.local`:

```env
CODEQR_ANALYTICS_SCRIPT_URL=https://cdn.codeqr.io/analytics/script.site-visit.outbound-domains.conversion.js
```

## API Endpoints

The conversion tracking uses these API endpoints:

- **Lead Tracking**: `POST /track/lead`
- **Sale Tracking**: `POST /track/sale`

Both endpoints require authentication and follow the CodeQR Track API specification.

## Troubleshooting

### No Click ID Found
- Visit a page with a CodeQR link first
- Use the test link: `/?cq_id=test-click-id`
- Check that the script is loaded properly

### API Errors
- Verify your API host configuration
- Check that you have the required permissions
- Ensure the customer ID is valid

### Script Not Loading
- Check the script URL in your environment variables
- Verify the CDN is accessible
- Check browser console for errors

## Learn More

- [Conversion Tracking Guide](../../docs/conversion-tracking-guide.md)
- [Track API Documentation](../../docs/track-api-documentation.md)
- [API Corrections Summary](../../docs/conversion-tracking-api-corrections.md)

