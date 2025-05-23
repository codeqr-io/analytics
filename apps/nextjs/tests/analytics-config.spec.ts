import { CODEQR_ANALYTICS_SCRIPT_URL } from '@/app/constants';
import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    _CodeQRAnalytics: any;
  }
}

test.describe('Analytics configuration', () => {
  test('should work with data-domains props', async ({ page }) => {
    await page.setContent(`
      <script src="${CODEQR_ANALYTICS_SCRIPT_URL}" defer
        data-domains='{"refer": "go.example.com", "site": "site.example.com", "outbound": "example.com,other.com"}'
      ></script>
    `);

    await page.waitForFunction(() => window._CodeQRAnalytics !== undefined);
    const analytics = await page.evaluate(() => window._CodeQRAnalytics);

    expect(analytics.n).toEqual({
      refer: 'go.example.com',
      site: 'site.example.com',
      outbound: 'example.com,other.com',
    });
  });

  test('should maintain backwards compatibility with data-short-domain', async ({
    page,
  }) => {
    // Set up test page with old shortDomain prop
    await page.setContent(`
      <script src="${CODEQR_ANALYTICS_SCRIPT_URL}" defer data-short-domain="go.example.com"></script>
    `);

    await page.waitForFunction(() => window._CodeQRAnalytics !== undefined);
    const analytics = await page.evaluate(() => window._CodeQRAnalytics);

    // Verify shortDomain was correctly mapped to domainsConfig.refer
    expect(analytics.n).toEqual({ refer: 'go.example.com' });
    expect(analytics.d).toBe('go.example.com');
  });

  test('should prioritize domainsConfig.refer over shortDomain', async ({
    page,
  }) => {
    // Set up test page with both old and new props
    await page.setContent(`
      <script src="${CODEQR_ANALYTICS_SCRIPT_URL}" defer
        data-short-domain="old.example.com"
        data-domains='{"refer": "new.example.com"}'
      ></script>
    `);

    await page.waitForFunction(() => window._CodeQRAnalytics !== undefined);

    // Verify domainsConfig.refer takes precedence
    const analytics = await page.evaluate(() => window._CodeQRAnalytics);
    expect(analytics.n).toEqual({ refer: 'new.example.com' });
    expect(analytics.d).toBe('new.example.com');
  });

  // Fix this test
  test('should handle first-click attribution model', async ({ page }) => {
    await page.setContent(`
      <script src="${CODEQR_ANALYTICS_SCRIPT_URL}" defer
        data-attribution-model="first-click"
        data-short-domain="getacme.link"
      ></script>
    `);

    await page.waitForFunction(() => window._CodeQRAnalytics !== undefined);
    const analytics = await page.evaluate(() => window._CodeQRAnalytics);
    expect(analytics.m).toBe('first-click');

    // First click
    await page.goto('/?cq_id=first-click-id');

    // Wait for the cookie to be set
    await expect(async () => {
      const cookies = await page.context().cookies();
      const codeqrIdCookie = cookies.find((cookie) => cookie.name === 'cq_id');

      expect(codeqrIdCookie).toBeDefined();
      expect(codeqrIdCookie?.value).toBe('first-click-id');
    }).toPass({ timeout: 3000 });

    // Second click
    await page.goto('/?cq_id=second-click-id');

    // Wait for the cookie to be set
    await expect(async () => {
      const cookies = await page.context().cookies();
      const codeqrIdCookie = cookies.find((cookie) => cookie.name === 'cq_id');

      expect(codeqrIdCookie).toBeDefined();
      expect(codeqrIdCookie?.value).toBe('first-click-id');
    }).toPass({ timeout: 3000 });
  });

  test('should handle last-click attribution model', async ({ page }) => {
    // Set up test page with last-click attribution
    await page.setContent(`
      <script src="${CODEQR_ANALYTICS_SCRIPT_URL}" defer
        data-attribution-model="last-click"
        data-short-domain="getacme.link"
      ></script>
    `);

    await page.waitForFunction(() => window._CodeQRAnalytics !== undefined);

    const analytics = await page.evaluate(() => window._CodeQRAnalytics);
    expect(analytics.m).toBe('last-click');

    // First click
    await page.goto('/?cq_id=first-click-id');

    // Wait for the cookie to be set
    await expect(async () => {
      const cookies = await page.context().cookies();
      const codeqrIdCookie = cookies.find((cookie) => cookie.name === 'cq_id');

      expect(codeqrIdCookie).toBeDefined();
      expect(codeqrIdCookie?.value).toBe('first-click-id');
    }).toPass({ timeout: 3000 });

    // Second click
    await page.goto('/?cq_id=second-click-id');

    // Wait for the cookie to be set
    await expect(async () => {
      const cookies = await page.context().cookies();
      const codeqrIdCookie = cookies.find((cookie) => cookie.name === 'cq_id');

      expect(codeqrIdCookie).toBeDefined();
      expect(codeqrIdCookie?.value).toBe('second-click-id');
    }).toPass({ timeout: 3000 });
  });
});
