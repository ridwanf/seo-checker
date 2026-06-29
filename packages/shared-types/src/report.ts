import { AuditCheck } from './audit';
import { ResponseTiming, RobotsInfo, SitemapInfo } from './crawler';
import { RuleCategory } from './rule';

export interface AuditCategory {
  category: RuleCategory;
  score: number;
  totalWeight: number;
  earnedWeight: number;
  checks: AuditCheck[];
}

export interface AuditReport {
  version: string; // e.g. "1.0"
  url: string;
  score: number;

  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };

  categories: AuditCategory[]; // Renamed from categoryScores

  crawl: {
    originalUrl: string;
    finalUrl: string;
    status: number;
    responseTime: ResponseTiming;
    contentType: string;
    pageSize: number;
    encoding?: string;
    protocol?: string;
    server?: string;
    redirectChain: string[];
    robots: RobotsInfo;
    sitemap: SitemapInfo;
    headers: Record<string, string>;
  };

  scoreBreakdown: {
    earnedWeight: number;
    totalWeight: number;
    percentage: number;
  };

  createdAt: Date;
}

// Re-export for convenience
export type { ResponseTiming, RobotsInfo, SitemapInfo } from './crawler';