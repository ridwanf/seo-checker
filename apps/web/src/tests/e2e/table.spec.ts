import { test, expect } from './fixtures';

test.describe('Issues Table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder(/https:\/\/example\.com/i)
      .fill('https://example.com');
    await page.getByRole('button', { name: /analyze/i }).click();

    // Wait for table to load
    await expect(page.getByTestId('issues-table')).toBeVisible({
      timeout: 30000,
    });
  });

  test('should filter by issues tab', async ({ page }) => {
    await page.getByRole('button', { name: /issues/i }).click();

    // All visible rows should be failed
    const statuses = await page.locator('td:has-text("✗ Failed")').count();
    const passed = await page.locator('td:has-text("✓ Passed")').count();

    expect(statuses).toBeGreaterThan(0);
    expect(passed).toBe(0);
  });

  test('should filter by passed tab', async ({ page }) => {
    await page.getByRole('button', { name: /passed/i }).click();

    // All visible rows should be passed
    const passed = await page.locator('td:has-text("✓ Passed")').count();
    const failed = await page.locator('td:has-text("✗ Failed")').count();

    expect(passed).toBeGreaterThan(0);
    expect(failed).toBe(0);
  });

  test('should search rules', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search rules/i);
    await searchInput.fill('title');

    // Results should be filtered
    const rows = page.locator('tbody tr:not(:has(td[colspan]))');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // Each row should contain "title"
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText(/title/i);
    }
  });

  test('should clear search when switching tabs', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search rules/i);
    await searchInput.fill('title');

    // Switch tab
    await page.getByRole('button', { name: /all checks/i }).click();

    // Search should be cleared
    await expect(searchInput).toHaveValue('');
  });

  test('should sort by severity', async ({ page }) => {
    // Click severity header to sort
    await page.getByRole('button', { name: /all checks/i }).click();
    await page.getByRole('columnheader', { name: /severity/i }).click();
    await page.getByRole('columnheader', { name: /severity/i }).click();

    // First row should be critical
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toContainText(/critical/i);
  });

  test('should show empty state for no search results', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search rules/i);
    await searchInput.fill('xyznonexistent123');

    await expect(page.getByText(/No results found/i)).toBeVisible();
  });
});