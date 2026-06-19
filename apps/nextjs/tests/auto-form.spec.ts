import { CODEQR_ANALYTICS_SCRIPT_URL } from '@/app/constants';
import { expect, test } from '@playwright/test';

declare global {
  interface Window {
    _CodeQRAnalytics: any;
  }
}

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
});
