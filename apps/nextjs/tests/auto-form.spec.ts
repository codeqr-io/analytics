import { CODEQR_ANALYTICS_SCRIPT_URL } from '@/app/constants';
import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    _CodeQRAnalytics: any;
  }
}

test.describe('Auto form capture — gating', () => {
  test('fires a lead for an allowlisted (attribute) form', async ({ page }) => {
    const requests: any[] = [];
    await page.route('**/track/lead/client', async (route) => {
      requests.push(JSON.parse(route.request().postData() || '{}'));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{"click":{"id":"x"},"customer":{"id":"y"}}',
      });
    });

    await page.goto('/auto-form-test');
    await page.click('#allowed-attr button[type="submit"]');

    await expect.poll(() => requests.length).toBeGreaterThan(0);
    expect(requests[0].eventName).toBe('Newsletter');
    expect(typeof requests[0].customerExternalId).toBe('string');
    expect(requests[0].customerExternalId.length).toBeGreaterThan(0);
  });

  test('does not fire for a non-allowlisted form', async ({ page }) => {
    let fired = false;
    await page.route('**/track/lead/client', async (route) => {
      fired = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      });
    });

    await page.goto('/auto-form-test');
    await page.click('#not-allowed button[type="submit"]');
    await page.waitForTimeout(1000);
    expect(fired).toBe(false);
  });

  test('does not fire for a form with data-codeqr-ignore', async ({ page }) => {
    let fired = false;
    await page.route('**/track/lead/client', async (route) => {
      fired = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{}',
      });
    });

    await page.goto('/auto-form-test');
    await page.click('#ignored button[type="submit"]');
    await page.waitForTimeout(1000);
    expect(fired).toBe(false);
  });
});

test.describe('Auto form capture — config', () => {
  test('parses data-auto-convert into _CodeQRAnalytics.ac', async ({
    page,
  }) => {
    await page.setContent(`
      <script src="${CODEQR_ANALYTICS_SCRIPT_URL}" defer
        data-publishable-key="cq_test_pk"
        data-auto-convert='{"forms":true,"formSelector":".lead","eventName":"Signup"}'
      ></script>
    `);

    await page.waitForFunction(() => window._CodeQRAnalytics !== undefined);
    const ac = await page.evaluate(() => window._CodeQRAnalytics.ac);
    expect(ac).toEqual({
      forms: true,
      formSelector: '.lead',
      eventName: 'Signup',
    });
  });

  test('falls back to null for malformed data-auto-convert', async ({
    page,
  }) => {
    await page.setContent(`
      <script src="${CODEQR_ANALYTICS_SCRIPT_URL}" defer
        data-publishable-key="cq_test_pk"
        data-auto-convert='{bad json'
      ></script>
    `);

    await page.waitForFunction(() => window._CodeQRAnalytics !== undefined);
    const ac = await page.evaluate(() => window._CodeQRAnalytics.ac);
    expect(ac).toBeNull();
  });
});
