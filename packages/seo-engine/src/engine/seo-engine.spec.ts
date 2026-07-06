import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { SeoEngine } from './seo-engine';
import { CrawlResult } from '@seo-checker/shared-types';

function makeCrawl(html: string, overrides?: Partial<CrawlResult>): CrawlResult {
  return {
    originalUrl: 'https://example.com',
    finalUrl: 'https://example.com',
    statusCode: 200,
    responseTime: { total: 150 },
    contentType: 'text/html',
    pageSize: Buffer.byteLength(html),
    html,
    headers: { 'content-type': 'text/html' },
    redirectChain: [],
    robots: { found: false },
    sitemap: { found: false },
    ...overrides,
  };
}

describe('SeoEngine', () => {
  it('should produce a valid AuditReport with score', async () => {
    const engine = new SeoEngine();
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Perfect Page Title — With Keywords</title>
  <meta name="description" content="A perfectly optimized meta description for search results that includes keywords.">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="canonical" href="https://example.com/">
  <meta property="og:title" content="Perfect Page">
  <meta name="twitter:card" content="summary">
  <link rel="icon" href="/favicon.ico">
  <meta name="robots" content="index, follow">
</head>
<body>
  <h1>Welcome</h1>
  <h2>Section 1</h2>
  <p>Some content.</p>
  <img src="photo.jpg" alt="A nice photo">
</body>
</html>`;

    const report = await engine.analyze(makeCrawl(html));

    expect(report).toBeDefined();
    expect(report.score).toBeGreaterThanOrEqual(0);
    expect(report.score).toBeLessThanOrEqual(100);
    expect(report.url).toBe('https://example.com');
    expect(report.version).toBe('1.0');
    expect(report.summary.total).toBeGreaterThan(0);
    expect(report.categories.length).toBeGreaterThan(0);
    expect(report.crawl).toBeDefined();
  });

  it('should detect issues and add fix examples', async () => {
    const engine = new SeoEngine();
    // Minimal HTML — many rules should fail
    const html = `<html><body><p>Hello</p><img src="nope.jpg"></body></html>`;

    const report = await engine.analyze(makeCrawl(html));

    const allChecks = report.categories.flatMap((c) => c.checks);
    const failedChecks = allChecks.filter((c) => !c.passed);

    expect(failedChecks.length).toBeGreaterThan(0);

    // At least some failed checks should have fix examples
    const withExamples = failedChecks.filter(
      (c) => c.fixExamples && c.fixExamples.length > 0
    );
    expect(withExamples.length).toBeGreaterThan(0);

    // Verify structure of fix examples
    for (const check of withExamples) {
      for (const example of check.fixExamples!) {
        expect(example.title).toBeTruthy();
        // Should have at least before, after, or explanation
        expect(
          example.before || example.after || example.explanation
        ).toBeTruthy();
      }
    }
  });

  it('should handle empty HTML gracefully', async () => {
    const engine = new SeoEngine();
    const report = await engine.analyze(makeCrawl(''));

    expect(report).toBeDefined();
    expect(report.score).toBeDefined();
    // Most rules should fail on empty HTML
    expect(report.summary.failed).toBeGreaterThan(0);
  });

  it('should return category scores that sum to weighted total', async () => {
    const engine = new SeoEngine();
    const html = '<html><body><h1>Test</h1></body></html>';
    const report = await engine.analyze(makeCrawl(html));

    const sumEarned = report.categories.reduce(
      (sum, c) => sum + c.earnedWeight,
      0
    );
    const sumTotal = report.categories.reduce(
      (sum, c) => sum + c.totalWeight,
      0
    );

    expect(report.scoreBreakdown.earnedWeight).toBe(sumEarned);
    expect(report.scoreBreakdown.totalWeight).toBe(sumTotal);
  });
});
