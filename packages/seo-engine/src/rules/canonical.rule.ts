import {
  AuditCategory,
  AuditCheck,
  SeoRule,
  SeoRuleContext,
} from '@seo-checker/shared-types';

import { load } from 'cheerio';

export class CanonicalRule
  implements SeoRule {
  id = 'canonical';

  name = 'Canonical URL';
  category: AuditCategory = 'technical';
  weight = 10;

  async execute(
    context: SeoRuleContext
  ): Promise<AuditCheck> {
    const $ = load(context.html);

    const canonical = $(
      'link[rel="canonical"]'
    ).attr('href');

    const exists =
      !!canonical?.trim();

    return {
      id: this.id,
      name: this.name,
      category: this.category,
      status: exists
        ? 'pass'
        : 'warning',
      score: exists ? 10 : 5,
      maxScore: 10,
      message: exists
        ? 'Canonical URL found'
        : 'Canonical URL missing',
      recommendation: exists
        ? undefined
        : 'Add a canonical URL',
    };
  }
}