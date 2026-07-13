import { test as base, expect } from '@playwright/test';
import { mockAuditReport } from '../mocks/audit.mock';

// Extend base test with mock fixture
export const test = base.extend({
  // Auto-mock audit API for all tests
  page: async ({ page }, use) => {
    // Intercept all audit API calls
    await page.route('**/api/audit', async (route) => {
      const request = route.request();

      if (request.method() === 'POST') {
        const body = request.postDataJSON();

        // Simulate validation error for invalid URLs
        if (!body?.url?.startsWith('http')) {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({
              statusCode: 400,
              error: 'Bad Request',
              message: 'Invalid URL format.',
            }),
          });
          return;
        }

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Return mock report
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockAuditReport),
        });
      }
    });

    await use(page);
  },
});

export { expect };