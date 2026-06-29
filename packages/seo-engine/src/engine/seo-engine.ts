import {
  AuditReport,
  AuditCheck,
  SeoRuleContext,
  CategoryScore,
  RuleCategory,
} from '@seo-checker/shared-types';
import * as cheerio from 'cheerio';
import { RuleRegistry } from '../registry/rule-registry.js';
import { createAllRules } from '../rules/all-rules.js';

export class SeoEngine {
  private registry: RuleRegistry;

  constructor() {
    this.registry = new RuleRegistry();
    this.registry.registerMany(createAllRules());
  }

  async analyze(
    url: string,
    html: string
  ): Promise<AuditReport> {
    const $ = cheerio.load(html);
    const context: SeoRuleContext = { url, html, $ };

    // Run all rules 
    const checks: AuditCheck[] = await Promise.all(
      this.registry.getAll().map((rule) => rule.check(context))
    );

    // calculate category scores
    const categoryScores = this.calculateCategoryScores(checks);

    // calclulate overall score
    const totalWeight = this.registry.getTotalWeight();
    const earnedWeight = this.calculateEarnedWeight(checks);
    const score = Math.round((earnedWeight / totalWeight) * 100);

    // generated summary
    const summary = {
      total: checks.length,
      passed: checks.filter((c) => c.passed).length,
      failed: checks.filter((c) => !c.passed && (c.severity === 'critical' || c.severity === 'major')).length,
      warnings: checks.filter((c) => !c.passed && c.severity === 'minor').length,
    };

    const crawlMetadata = {
      status: 200, // Example, replace with actual data
      responseTime: 142, // Example, replace with actual data
      contentType: 'text/html', // Example, replace with actual data
      pageSize: html.length,
      redirects: 1, // Example, replace with actual data
      robotsTxtFound: true, // Example, replace with actual data
      sitemapXmlFound: false, // Example, replace with actual data
    };

    const scoreBreakdown = {
      earnedWeight,
      totalWeight,
      percentage: score,
    };

    return {
      url,
      score,
      categoryScores,
      createdAt: new Date(),
      summary,
      crawl: crawlMetadata,
      scoreBreakdown
    };
  }

  private calculateCategoryScores(checks: AuditCheck[]): CategoryScore[] {
    const categories = Object.values(RuleCategory);
    const scores: CategoryScore[] = [];

    for (const category of categories) {
      const categoryRules = this.registry.getByCategory(category);
      const categoryChecks = checks.filter((check) =>
        categoryRules.some((rule) => rule.metadata.id === check.rule)
      );

      if (categoryChecks.length === 0) continue;

      const totalWeight = categoryRules.reduce((sum, rule) => sum + rule.metadata.weight, 0);

      const earnedWeight = categoryChecks.reduce((sum, check) => {
        const rule = categoryRules.find((r) => r.metadata.id === check.rule);
        if (!rule) return sum;
        return sum + (check.passed ? rule.metadata.weight : 0);
      }, 0)

      const score = Math.round((earnedWeight / totalWeight) * 100);

      scores.push({
        category,
        score,
        totalWeight,
        earnedWeight,
        checks: categoryChecks,
      });
    }

    return scores.sort((a, b) => b.score - a.score);
  }

  private calculateEarnedWeight(checks: AuditCheck[]): number {
    return checks.reduce((sum, check) => {
      const rule = this.registry.getById(check.rule);
      if (!rule) return sum;
      return sum + (check.passed ? rule.metadata.weight : 0);
    }, 0);
  }

  getRegistry(): RuleRegistry {
    return this.registry;
  }

}

