import {
  AuditCategory,
  AuditCheck,
  SeoRule,
  SeoRuleContext,
} from '@seo-checker/shared-types';

import { load } from 'cheerio';

export class TitleExistsRule implements SeoRule {
  id = "title-exists";
  name = "Title Exists";
  category: AuditCategory = "metadata";
  weight = 10;

  async execute(
    context: SeoRuleContext
  ): Promise<AuditCheck> {
    const $ = load(context.html);

    const title = $('title').text().trim();

    const passed = title.length > 0;

    return {
      id: this.id,
      name: this.name,
      category: this.category,
      status: passed ? 'pass' : 'fail',
      score: passed ? 10 : 0,
      maxScore: 10,
      message: passed ? `Title found (${title.length} chars)` : 'Title tag missing',
      recommendation: passed ? undefined : 'Add a <title> tag to the <head> section of your HTML document.',
    }
  }
}