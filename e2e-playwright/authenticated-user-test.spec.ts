import { test, expect } from '@playwright/test';

test('Login user_test', async ({ page }) => {
  await page.goto('/');

  const username = page.locator('.header');
  await expect(username).toHaveText(/user_test/);
});
