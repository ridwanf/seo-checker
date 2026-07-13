import { test, expect } from '@playwright/test';
import { mockRateLimitError } from './mocks/audit.mock';

test.describe('Error Handling', () => {
  test('should show rate limit error', async ({ page }) => {
    // Mock rate limit response
    await page.route('**/api/audit', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify(mockRateLimitError),
      });
    });

    await page.goto('/');
    await page.getByPlaceholder(/https:\/\/example\.com/i)
      .fill('https://example.com');
    await page.getByRole('button', { name: /analyze/i }).click();

    await expect(page.getByText(/daily limit/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('should show server error', async ({ page }) => {
    // Mock server error
    await page.route('**/api/audit', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 500,
          message: 'Internal server error',
        }),
      });
    });

    await page.goto('/');
    await page.getByPlaceholder(/https:\/\/example\.com/i)
      .fill('https://example.com');
    await page.getByRole('button', { name: /analyze/i }).click();

    await expect(page.getByText(/server error/i)).toBeVisible({
      timeout: 10000,
    });
  });
});