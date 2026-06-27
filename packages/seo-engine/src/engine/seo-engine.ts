import {
  AuditReport,
  calculateGrade,
  SeoRule
} from '@seo-checker/shared-types';

export class SeoEngine {
  constructor(private rules: SeoRule[]) { }

  async analyze(
    url: string,
    html: string
  ): Promise<AuditReport> {
    const checks = await Promise.all(
      this.rules.map((rule) => rule.execute({ url, html }))
    );

    const totalScore = checks.reduce((sum: number, c: { score: number }) => sum + c.score, 0);
    return {
      url,
      score: totalScore,
      createdAt: new Date().toISOString(),
      checks,
      grade: calculateGrade(totalScore),
    }
  }
}