import {
  AuditCheck,
  SeoRule,
  SeoRuleContext,
} from '@seo-checker/shared-types';

import { load } from 'cheerio';

export class H1ExistsRule
  implements SeoRule {
  id = 'h1-exists';

  name = 'H1 Exists';

  weight = 10;

  async execute(
    context: SeoRuleContext
  ): Promise<AuditCheck> {
    const $ = load(context.html);

    const h1Count =
      $('h1').length;

    if (h1Count === 1) {
      return {
        id: this.id,
        name: this.name,
        category: 'content',
        status: 'pass',
        score: 10,
        maxScore: 10,
        message:
          'Exactly one H1 found',
      };
    }

    if (h1Count > 1) {
      return {
        id: this.id,
        name: this.name,
        category: 'content',
        status: 'warning',
        score: 5,
        maxScore: 10,
        message: `${h1Count} H1 tags found`,
        recommendation:
          'Use a single H1 tag',
      };
    }

    return {
      id: this.id,
      name: this.name,
      category: 'content',
      status: 'fail',
      score: 0,
      maxScore: 10,
      message: 'No H1 found',
      recommendation:
        'Add an H1 tag',
    };
  }
}