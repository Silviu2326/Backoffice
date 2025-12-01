import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // 1. Navigate to login
  await page.goto('/login');

  // 2. Fill credentials
  await page.fill('input[type="email"]', 'admin@mrcoolcat.com');
  await page.fill('input[type="password"]', 'admin@mrcoolcat.com');

  // 3. Submit
  await page.click('button[type="submit"]');

  // 4. Wait for redirect to dashboard
  await page.waitForURL('/admin/dashboard', { timeout: 15000 });
  await expect(page.getByText('Dashboard')).toBeVisible();

  // 5. Save storage state
  await page.context().storageState({ path: authFile });
});
