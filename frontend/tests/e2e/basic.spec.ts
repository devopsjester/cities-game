import { test, expect } from '@playwright/test';

test('basic app loads', async ({ page }) => {
  await page.goto('/');
  
  // Check that the page loads
  await expect(page).toHaveTitle(/Cities Game/i);
  
  // Basic smoke test - just ensure no crash
  await page.waitForTimeout(1000);
});