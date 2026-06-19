import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    _CodeQRAnalytics: any;
  }
}

test.describe('Attribution window (localStorage mirror)', () => {
  test('mirrors cq_id into localStorage when the cookie is set', async ({
    page,
  }) => {
    await page.goto('/?cq_id=mirror-test-id');

    await expect(async () => {
      const cookies = await page.context().cookies();
      expect(cookies.find((c) => c.name === 'cq_id')?.value).toBe(
        'mirror-test-id',
      );
    }).toPass({ timeout: 5000 });

    const mirror = await page.evaluate(() =>
      window.localStorage.getItem('cq_id'),
    );
    expect(mirror).toBeTruthy();
    const parsed = JSON.parse(mirror as string);
    expect(parsed.value).toBe('mirror-test-id');
    expect(typeof parsed.expires).toBe('number');
    expect(parsed.expires).toBeGreaterThan(Date.now());
  });

  test('restores cq_id from the mirror when the cookie is missing', async ({
    page,
  }) => {
    // First visit sets cookie + mirror.
    await page.goto('/?cq_id=restore-test-id');
    await expect(async () => {
      const cookies = await page.context().cookies();
      expect(cookies.find((c) => c.name === 'cq_id')?.value).toBe(
        'restore-test-id',
      );
    }).toPass({ timeout: 5000 });

    // Simulate ITP dropping the client-side cookie (mirror survives).
    await page.context().clearCookies();
    expect(
      (await page.context().cookies()).find((c) => c.name === 'cq_id'),
    ).toBeUndefined();

    // Reload with no cq_id param — init() must restore the cookie from the mirror.
    await page.goto('/');
    await expect(async () => {
      const cookies = await page.context().cookies();
      expect(cookies.find((c) => c.name === 'cq_id')?.value).toBe(
        'restore-test-id',
      );
    }).toPass({ timeout: 5000 });
  });

  test('does not restore from an expired mirror', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem(
        'cq_id',
        JSON.stringify({ value: 'expired-id', expires: Date.now() - 1000 }),
      );
    });
    await page.context().clearCookies();

    await page.goto('/');
    await page.waitForTimeout(1500);
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === 'cq_id')).toBeUndefined();
  });
});
