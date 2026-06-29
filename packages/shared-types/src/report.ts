import { AuditCheck } from "./audit.js";
import { RuleCategory } from "./rule.js";

export interface CategoryScore {
  category: RuleCategory;
  score: number;
  totalWeight: number;
  earnedWeight: number;
  checks: AuditCheck[];
}

export interface AuditReport {
  url: string;
  score: number;
  categoryScores: CategoryScore[];
  createdAt: Date;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  crawl: {
    status: number;
    responseTime: number;
    contentType: string;
    pageSize: number;
    redirects: number;
    robotsTxtFound: boolean;
    sitemapXmlFound: boolean;
  };
  scoreBreakdown: {
    earnedWeight: number;
    totalWeight: number;
    percentage: number;
  };
}