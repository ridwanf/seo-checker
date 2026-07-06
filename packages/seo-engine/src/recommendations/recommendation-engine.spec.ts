import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { RecommendationEngine } from './recommendation-engine';
import { SeoRuleContext, AuditCheck, RuleCategory, CrawlResult } from '@seo-checker/shared-types';

function makeContext(html: string): SeoRuleContext {
  const crawl: CrawlResult = {
    originalUrl: 'https://example.com',
    finalUrl: 'https://example.com',
    statusCode: 200,
    responseTime: { total: 100 },
    contentType: 'text/html',
    pageSize: Buffer.byteLength(html),
    html,
    headers: { 'content-type': 'text/html' },
    redirectChain: [],
    robots: { found: false },
    sitemap: { found: false },
  };
  return { crawl, $: cheerio.load(html) };
}

function failedCheck(
  id: string,
  overrides?: Partial<AuditCheck>
): AuditCheck {
  return {
    id,
    rule: 'Test Rule',
    category: RuleCategory.META_TAGS,
    passed: false,
    message: 'Failed',
    severity: 'major',
    ...overrides,
  };
}

function passedCheck(id: string): AuditCheck {
  return {
    id,
    rule: 'Test Rule',
    category: RuleCategory.META_TAGS,
    passed: true,
    message: 'Passed',
  };
}

describe('RecommendationEngine', () => {
  const engine = new RecommendationEngine();

  it('should return undefined for passed checks', () => {
    const ctx = makeContext('<html></html>');
    const result = engine.generate(passedCheck('META001'), ctx);
    expect(result).toBeUndefined();
  });

  it('should return fix examples for known rule IDs', () => {
    const ctx = makeContext('<html><head></head></html>');
    const result = engine.generate(failedCheck('META001'), ctx);
    expect(result).toBeDefined();
    expect(result!.length).toBeGreaterThan(0);
    expect(result![0].title).toBeTruthy();
    expect(result![0].before).toBeTruthy();
    expect(result![0].after).toBeTruthy();
  });

  it('should return fix examples for all registered rules', () => {
    const ctx = makeContext('<html></html>');
    const knownIds = [
      'META001',
      'META002',
      'META003',
      'META004',
      'META005',
      'CON001',
      'CON002',
      'CON003',
      'TECH001',
      'TECH002',
      'TECH003',
      'TECH004',
      'TECH005',
      'SOCIAL001',
      'SOCIAL002',
      'A11Y001',
      'PERF001',
      'PERF002',
    ];

    for (const id of knownIds) {
      const result = engine.generate(failedCheck(id), ctx);
      expect(
        result,
        `Rule ${id} should have fix examples`
      ).toBeDefined();
      expect(result!.length).toBeGreaterThan(0);
    }
  });

  it('should return undefined for unknown rule IDs', () => {
    const ctx = makeContext('<html></html>');
    const result = engine.generate(failedCheck('UNKNOWN'), ctx);
    expect(result).toBeUndefined();
  });

  it('should generate contextual fix examples for missing title', () => {
    const ctx = makeContext('<html><head><title></title></head><body><p>Hi</p></body></html>');
    const result = engine.generate(failedCheck('META001'), ctx);
    expect(result).toBeDefined();
    expect(result![0].title).toContain('title');
  });

  it('should generate contextual fix examples for images missing alt text', () => {
    const ctx = makeContext(
      '<html><body><img src="photo.jpg"><img src="logo.png"></body></html>'
    );
    const result = engine.generate(failedCheck('CON002'), ctx);
    expect(result).toBeDefined();
    // Should provide fix examples for at least one image
    expect(result!.length).toBeGreaterThan(0);
    if (result![0].before) {
      expect(result![0].before).toContain('src=');
    }
    if (result![0].after) {
      expect(result![0].after).toContain('alt=');
    }
  });

  it('should generate contextual fix examples for title length issues', () => {
    const shortTitle = 'Short';
    const ctx = makeContext(
      `<html><head><title>${shortTitle}</title></head><body></body></html>`
    );
    const result = engine.generate(failedCheck('META002'), ctx);
    expect(result).toBeDefined();
    expect(result![0].title).toContain('Lengthen');
    expect(result![0].before).toContain(shortTitle);
  });
});
