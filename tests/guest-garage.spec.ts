import { test, expect } from '@playwright/test';

test('guest can open Garage', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /guest log in/i }).click();
  await expect(page).toHaveURL(/panel\/garage/);
  await expect(page.getByRole('heading', { name: /garage/i })).toBeVisible();
});
