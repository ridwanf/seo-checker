import { AuditCheck } from "./audit.js";
import { CheerioAPI } from "cheerio";
import { CrawlResult } from "./crawler.js";
export interface SeoRuleContext {
  crawl: CrawlResult;
  $: CheerioAPI;
}

export enum RuleCategory {
  META_TAGS = 'meta-tags',
  CONTENT = 'content',
  TECHNICAL = 'technical',
  SOCIAL = 'social',
  PERFORMANCE = 'performance',
  ACCESSIBILITY = 'accessibility',
}

export interface RuleMetadata {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  weight: number; // 1-10, higher = more important
}
export interface SeoRule {
  metadata: RuleMetadata;
  check(context: SeoRuleContext): AuditCheck | Promise<AuditCheck>;
}