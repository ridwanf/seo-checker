import * as cheerio from 'cheerio';
import {
  AuditReport,
  AuditCheck,
  AuditCategory,
  SeoRuleContext,
  CrawlResult,
  RuleCategory,
} from '@seo-checker/shared-types';
import { RuleRegistry } from '../registry/rule-registry';
import { createAllRules } from '../rules/all-rules';

const VERSION = '1.0';

export class SeoEngine {
  private registry: RuleRegistry;

  constructor() {
    this.registry = new RuleRegistry();
    this.registry.registerMany(createAllRules());
  }

  async analyze(crawl: CrawlResult): Promise<AuditReport> {
    const $ = cheerio.load(crawl.html);
    const context: SeoRuleContext = { crawl, $ };

    // Run all rules
    const checks: AuditCheck[] = await Promise.all(
      this.registry.getAll().map((rule) => rule.check(context))
    );

    // Calculate category scores
    const categories = this.buildCategories(checks);

    // Calculate weighted score
    const totalWeight = this.registry.getTotalWeight();
    const earnedWeight = this.calculateEarnedWeight(checks);
    const score = Math.round((earnedWeight / totalWeight) * 100);

    // Build summary
    const summary = {
      total: checks.length,
      passed: checks.filter((c) => c.passed).length,
      failed: checks.filter((c) => !c.passed && (c.severity === 'critical' || c.severity === 'major')).length,
      warnings: checks.filter((c) => !c.passed && c.severity === 'minor').length,
    };

    return {
      version: VERSION,
      url: crawl.finalUrl,
      score,
      summary,
      categories,
      crawl: {
        originalUrl: crawl.originalUrl,
        finalUrl: crawl.finalUrl,
        status: crawl.statusCode,
        responseTime: crawl.responseTime,
        contentType: crawl.contentType,
        pageSize: crawl.pageSize,
        encoding: crawl.encoding,
        protocol: crawl.protocol,
        server: crawl.server,
        redirectChain: crawl.redirectChain,
        robots: crawl.robots,
        sitemap: crawl.sitemap,
        headers: crawl.headers,
      },
      scoreBreakdown: {
        earnedWeight,
        totalWeight,
        percentage: score,
      },
      createdAt: new Date(),
    };
  }

  private buildCategories(checks: AuditCheck[]): AuditCategory[] {
    return Object.values(RuleCategory).map((category) => {
      const rules = this.registry.getByCategory(category);
      const categoryChecks = checks.filter((c) => c.category === category);

      const totalWeight = rules.reduce((sum, r) => sum + r.metadata.weight, 0);
      const earnedWeight = categoryChecks.reduce((sum, check) => {
        const rule = rules.find((r) => r.metadata.id === check.id);
        return sum + (check.passed && rule ? rule.metadata.weight : 0);
      }, 0);

      const score = totalWeight > 0
        ? Math.round((earnedWeight / totalWeight) * 100)
        : 0;

      return { category, score, totalWeight, earnedWeight, checks: categoryChecks };
    }).filter((c) => c.checks.length > 0);
  }

  private calculateEarnedWeight(checks: AuditCheck[]): number {
    return checks.reduce((sum, check) => {
      const rule = this.registry.getById(check.id);
      return sum + (check.passed && rule ? rule.metadata.weight : 0);
    }, 0);
  }
}