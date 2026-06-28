import {
  AuditReport,
  SeoRule,
  AuditCheck,
  Grade
} from '@seo-checker/shared-types';
import { TitleExistsRule } from '../rules/title-exists.rule.js';
import { CanonicalRule } from '../rules/canonical.rule.js';
import { H1ExistsRule } from '../rules/h1-exists.rule.js';
import { MetaDescriptionExistsRule } from '../rules/meta-description-exists.rule.js';
import { MetaDescriptionLengthRule } from '../rules/meta-description-length.rule.js';
import { TitleLengthRule } from '../rules/title-length.rule.js';
import { load } from 'cheerio';

export class SeoEngine {
  private readonly rules: SeoRule[]
  constructor() {
    this.rules = [
      new TitleExistsRule(),
      new CanonicalRule(),
      new H1ExistsRule(),
      new MetaDescriptionExistsRule(),
      new MetaDescriptionLengthRule(),
      new TitleLengthRule(),
    ];
  }

  async analyze(
    url: string,
    html: string
  ): Promise<AuditReport> {
    const $ = load(html);

    const checks: AuditCheck[] = [];

    for (const rule of this.rules) {
      const result = await rule.execute({ url, html, $ });
      checks.push(result);
    }

    const earnedScore =
      checks.reduce(
        (sum, check) => sum + check.score,
        0,
      );

    const possibleScore =
      checks.reduce(
        (sum, check) => sum + check.maxScore,
        0,
      );

    const score =
      Math.round(
        (earnedScore / possibleScore) *
        100,
      );

    const summary = {
      passed:
        checks.filter(
          (c) => c.status === 'pass',
        ).length,

      warnings:
        checks.filter(
          (c) =>
            c.status === 'warning',
        ).length,

      failed:
        checks.filter(
          (c) => c.status === 'fail',
        ).length,
    };

    return {
      url,
      score,
      createdAt: new Date().toISOString(),
      checks,
      summary,
      grade: this.calculateGrade(score),
    }
  }
  private calculateGrade(score: number): Grade {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  }
}

