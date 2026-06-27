import {
  AuditCheck,
  SeoRule,
  SeoRuleContext,
} from '@seo-checker/shared-types';

import { load } from 'cheerio';

export class MetaDescriptionExistsRule implements SeoRule {
  id = "meta-description-exists";
  name = "Meta Description Exists";
  weight = 10;

  async execute(
    context: SeoRuleContext
  ): Promise<AuditCheck> {
    const $ = load(context.html);

    const description = $('meta[name="description"]').attr('content');

    const passed = !!description && description.trim().length > 0;

    return {
      id: this.id,
      category: 'metadata',
      name: this.name,
      status: passed ? 'pass' : 'fail',
      score: passed ? 10 : 0,
      maxScore: 10,
      message: passed ? `Meta description found (${description?.length} chars)` : 'Meta description tag missing',
      recommendation: passed ? undefined : 'Add a <meta name="description" content="..."> tag to the <head> section of your HTML document.',
    }
  }
}
