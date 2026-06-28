import { load } from "cheerio";
import { AuditCheck } from '@seo-checker/shared-types';
import { SeoRule, SeoRuleContext } from '@seo-checker/shared-types';

export class TitleLengthRule implements SeoRule {
  id = 'title-length';
  name = 'Title Length';
  weight = 1;

  async execute(context: SeoRuleContext): Promise<AuditCheck> {
    const $ = load(context.html);

    const title = $('title').text().trim();

    const length = title.length;

    if (!title) {
      return {
        id: this.id,
        name: this.name,
        category: 'metadata',
        status: 'fail',
        score: 0,
        maxScore: 10,
        message: 'Title tag missing',
        recommendation: 'Add a <title> tag to the <head> section of your HTML document.',
      };
    }

    if (length >= 30 && length <= 60) {
      return {
        id: this.id,
        name: this.name,
        category: 'metadata',
        status: 'pass',
        score: 10,
        maxScore: 10,
        message: `Title length is optimal (${length} chars)`,
      };
    }

    return {
      id: this.id,
      name: this.name,
      category: 'metadata',
      status: 'warning',
      score: 5,
      maxScore: 10,
      message: `Title length is  (${length} chars)`,
      recommendation: 'Ensure the title length is between 30 and 60 characters for optimal SEO.',
    };
  }

}