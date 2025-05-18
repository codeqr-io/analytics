import { expect, test } from '@playwright/test';

test('should load the home page', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('CodeQR Analytics');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'CodeQR Analytics Example App',
  );

  await expect(page.getByRole('main')).toBeVisible();
});
