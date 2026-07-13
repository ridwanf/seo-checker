import { test, expect } from './fixtures';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/SEO Checker/i);
    await expect(page.getByPlaceholder(/https:\/\/example\.com/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /analyze/i })).toBeVisible();
  });

  test('should show validation error for invalid URL', async ({ page }) => {
    await page.getByPlaceholder(/https:\/\/example\.com/i).fill('not-a-url');
    await page.getByRole('button', { name: /analyze/i }).click();
    await expect(page.getByText(/http/i)).toBeVisible();
  });
});