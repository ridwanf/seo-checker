import { RuleCategory, type AuditReport } from '@seo-checker/shared-types';

export const mockAuditReport: AuditReport = {
  version: '1.0',
  url: 'https://example.com',
  score: 68,
  summary: {
    total: 17,
    passed: 10,
    failed: 4,
    warnings: 3,
  },
  categories: [
    {
      category: RuleCategory.META_TAGS,
      score: 85,
      totalWeight: 42,
      earnedWeight: 36,
      checks: [
        {
          id: 'META001',
          rule: 'Title Tag Exists',
          category: RuleCategory.META_TAGS,
          passed: true,
          message: 'Page has a title tag.',
        },
        {
          id: 'META002',
          rule: 'Title Length',
          category: RuleCategory.META_TAGS,
          passed: false,
          message: 'Title is too short (10 characters).',
          severity: 'minor',
          recommendation: 'Rewrite the title to be between 30 and 60 characters.',
          why: 'Titles that are too short may not rank for enough keywords.',
        },
      ],
    },
    {
      category: RuleCategory.TECHNICAL,
      score: 70,
      totalWeight: 36,
      earnedWeight: 25,
      checks: [
        {
          id: 'TECH001',
          rule: 'Canonical URL',
          category: RuleCategory.TECHNICAL,
          passed: false,
          message: 'Page is missing a canonical URL.',
          severity: 'major',
          recommendation: 'Add <link rel="canonical"> to the <head>.',
          why: 'Canonical tags prevent duplicate content issues.',
        },
        {
          id: 'TECH002',
          rule: 'HTTPS Protocol',
          category: RuleCategory.TECHNICAL,
          passed: true,
          message: 'Page uses HTTPS protocol.',
        },
      ],
    },
    {
      category: RuleCategory.CONTENT,
      score: 55,
      totalWeight: 22,
      earnedWeight: 12,
      checks: [
        {
          id: 'CON001',
          rule: 'H1 Heading Exists',
          category: RuleCategory.CONTENT,
          passed: false,
          message: 'Page is missing an H1 heading.',
          severity: 'critical',
          recommendation: 'Add a single H1 heading that describes the main topic.',
          why: 'The H1 heading signals the primary topic to search engines.',
        },
      ],
    },
    {
      category: RuleCategory.SOCIAL,
      score: 0,
      totalWeight: 13,
      earnedWeight: 0,
      checks: [
        {
          id: 'SOC001',
          rule: 'Open Graph Tags',
          category: RuleCategory.SOCIAL,
          passed: false,
          message: 'Missing Open Graph tags: og:title, og:description.',
          severity: 'minor',
          recommendation: 'Add Open Graph meta tags to the <head>.',
          why: 'Open Graph tags control how your page appears on social media.',
        },
      ],
    },
  ],
  crawl: {
    originalUrl: 'https://example.com',
    finalUrl: 'https://example.com',
    status: 200,
    responseTime: { total: 1250 },
    contentType: 'text/html; charset=UTF-8',
    pageSize: 17163,
    encoding: 'gzip',
    protocol: 'HTTP/2',
    server: 'CloudFront',
    redirectChain: [],
    robots: { found: true, url: 'https://example.com/robots.txt' },
    sitemap: { found: false },
    headers: {
      'content-type': 'text/html; charset=UTF-8',
      'cache-control': 'max-age=604800',
    },
  },
  scoreBreakdown: {
    earnedWeight: 87,
    totalWeight: 128,
    percentage: 68,
  },
  createdAt: new Date().toISOString() as unknown as Date,
};

export const mockRateLimitError = {
  statusCode: 429,
  error: 'Too Many Requests',
  message: 'Daily limit reached. You can run another audit after 11:59 PM.',
  resetAt: new Date().toISOString(),
  limit: 3,
};

export const mockValidationError = {
  statusCode: 400,
  error: 'Bad Request',
  message: 'Invalid URL format.',
};