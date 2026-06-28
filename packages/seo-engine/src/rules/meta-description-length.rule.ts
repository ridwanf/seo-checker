import { load } from "cheerio";
import { AuditCheck } from '@seo-checker/shared-types';
import { SeoRule, SeoRuleContext } from '@seo-checker/shared-types';

export class MetaDescriptionLengthRule implements SeoRule {
  id = "meta-description-length";
  name = 'Meta Description Length';
  weight = 10;
  async execute(context: SeoRuleContext): Promise<AuditCheck> {
    const $ = load(context.html);

    const description = $('meta[name="description"]').attr('content')?.trim() || '';

    const length = description.length;

    if (!description) {
      return {
        id: this.id,
        name: this.name,
        category: 'metadata',
        status: 'fail',
        score: 0,
        maxScore: 10,
        message: 'Meta description tag missing',
        recommendation: 'Add a <meta name="description" content="..."> tag to the <head> section of your HTML document.',
      };
    }

    if (length >= 120 && length <= 160) {
      return {
        id: this.id,
        name: this.name,
        category: 'metadata',
        status: 'pass',
        score: 10,
        maxScore: 10,
        message: `Meta description length is optimal (${length} chars)`,
      };
    }

    return {
      id: this.id,
      name: this.name,
      category: 'metadata',
      status: 'warning',
      score: 5,
      maxScore: 10,
      message: `Meta description length is (${length} chars)`,
      recommendation: 'Ensure the meta description length is between 120 and 160 characters for optimal SEO.',
    };

  }

}