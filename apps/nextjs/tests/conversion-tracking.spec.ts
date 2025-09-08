import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    CodeQRAnalytics: {
      trackLead: (data: any) => Promise<any>;
      trackSale: (data: any) => Promise<any>;
      getClickId: () => string | null;
      hasClickId: () => boolean;
      getConfig: () => any;
    };
  }
}

test.describe('Conversion Tracking', () => {
  test('should load conversion tracking page', async ({ page }) => {
    await page.goto('/conversion-test');

    await expect(page).toHaveTitle('CodeQR Analytics');
    await expect(
      page.getByRole('heading', {
        name: 'CodeQR Analytics - Conversion Tracking Test',
      }),
    ).toBeVisible();
  });

  test('should show debug information', async ({ page }) => {
    await page.goto('/conversion-test');

    // Wait for the page to load and debug info to appear
    await page.waitForTimeout(2000);

    // Check if debug section is visible
    await expect(
      page.getByRole('heading', { name: 'Debug Information' }),
    ).toBeVisible();

    // Check if debug items are present
    await expect(page.getByText('Has Click ID:')).toBeVisible();
    await expect(page.getByText('Click ID:')).toBeVisible();
    await expect(page.getByText('API Host:')).toBeVisible();
  });

  test('should show conversion tracking forms', async ({ page }) => {
    await page.goto('/conversion-test');

    // Check if both forms are visible
    await expect(
      page.getByRole('heading', { name: 'Lead Tracking Test' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Sale Tracking Test' }),
    ).toBeVisible();

    // Check if form fields are present
    await expect(page.getByLabel('Event Name:')).toBeVisible();
    await expect(page.getByLabel('Customer ID:')).toBeVisible();
    await expect(page.getByLabel('Amount (USD):')).toBeVisible();
    await expect(page.getByLabel('Payment Processor:')).toBeVisible();
  });

  test('should show quick test buttons', async ({ page }) => {
    await page.goto('/conversion-test');

    await expect(
      page.getByRole('button', { name: 'Test Lead Event' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Test Sale Event' }),
    ).toBeVisible();
  });

  test('should show instructions section', async ({ page }) => {
    await page.goto('/conversion-test');

    await expect(
      page.getByRole('heading', { name: 'How to Test' }),
    ).toBeVisible();
    await expect(page.getByText('First, get a click ID:')).toBeVisible();
    await expect(page.getByText('Check Debug Info:')).toBeVisible();
  });

  test('should have test link in instructions', async ({ page }) => {
    await page.goto('/conversion-test');

    const testLink = page.getByRole('link', { name: 'test link' });
    await expect(testLink).toBeVisible();
    await expect(testLink).toHaveAttribute('href', '/?cq_id=test-click-id');
  });

  test('should show CodeQRAnalytics object when script is loaded', async ({
    page,
  }) => {
    await page.goto('/conversion-test');

    // Wait for the script to load
    await page.waitForFunction(
      () => {
        return (
          typeof window !== 'undefined' && window.CodeQRAnalytics !== undefined
        );
      },
      { timeout: 10000 },
    );

    // Check if the object has the expected methods
    const hasMethods = await page.evaluate(() => {
      const analytics = window.CodeQRAnalytics;
      return {
        hasTrackLead: typeof analytics.trackLead === 'function',
        hasTrackSale: typeof analytics.trackSale === 'function',
        hasGetClickId: typeof analytics.getClickId === 'function',
        hasHasClickId: typeof analytics.hasClickId === 'function',
        hasGetConfig: typeof analytics.getConfig === 'function',
      };
    });

    expect(hasMethods.hasTrackLead).toBe(true);
    expect(hasMethods.hasTrackSale).toBe(true);
    expect(hasMethods.hasGetClickId).toBe(true);
    expect(hasMethods.hasHasClickId).toBe(true);
    expect(hasMethods.hasGetConfig).toBe(true);
  });

  test('should show click ID when visiting with cq_id parameter', async ({
    page,
  }) => {
    await page.goto('/conversion-test?cq_id=test-click-id-123');

    // Wait for the page to load and debug info to update
    await page.waitForTimeout(3000);

    // Check if debug info shows the click ID
    await expect(page.getByText('Has Click ID: ✅ Yes')).toBeVisible();
    await expect(page.getByText('Click ID: test-click-id-123')).toBeVisible();
  });

  test('should show no click ID when visiting without cq_id parameter', async ({
    page,
  }) => {
    await page.goto('/conversion-test');

    // Wait for the page to load and debug info to update
    await page.waitForTimeout(3000);

    // Check if debug info shows no click ID
    await expect(page.getByText('Has Click ID: ❌ No')).toBeVisible();
    await expect(page.getByText('Click ID: None')).toBeVisible();
  });

  test('should have responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/conversion-test');

    // Check if the page is still functional on mobile
    await expect(
      page.getByRole('heading', {
        name: 'CodeQR Analytics - Conversion Tracking Test',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Test Lead Event' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Test Sale Event' }),
    ).toBeVisible();
  });
});
