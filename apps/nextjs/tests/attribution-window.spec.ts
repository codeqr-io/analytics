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
});
