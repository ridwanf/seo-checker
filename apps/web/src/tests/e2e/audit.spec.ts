import { test, expect } from './fixtures';

test.describe('Audit Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should analyze a website and show results', async ({ page }) => {
    await page.getByPlaceholder(/https:\/\/example\.com/i)
      .fill('https://example.com');
    await page.getByRole('button', { name: /analyze/i }).click();

    // Loading state
    await expect(page.getByText(/crawling/i)).toBeVisible();

    // Results appear
    await expect(page.getByRole('img')).toBeVisible({
      timeout: 10000,
    });

    // Summary cards
    await expect(page.getByTestId('summary-passed')).toContainText('10');
    await expect(page.getByTestId('summary-failed')).toContainText('4');
  });

  test('should show issues table', async ({ page }) => {
    await page.getByPlaceholder(/https:\/\/example\.com/i)
      .fill('https://example.com');
    await page.getByRole('button', { name: /analyze/i }).click();

    await expect(page.getByTestId('issues-table')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should expand issue row', async ({ page }) => {
    await page.getByPlaceholder(/https:\/\/example\.com/i)
      .fill('https://example.com');
    await page.getByRole('button', { name: /analyze/i }).click();

    await expect(page.getByTestId('issues-table')).toBeVisible({
      timeout: 10000,
    });

    // Click first failed row
    await page.locator('tr.cursor-pointer').first().click();
    await expect(page.getByText(/how to fix/i)).toBeVisible();
    await expect(page.getByText(/why it matters/i)).toBeVisible();
  });
});