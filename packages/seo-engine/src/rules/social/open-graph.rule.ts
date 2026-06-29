import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class OpenGraphRule extends BaseRule {
  metadata = {
    id: 'SOC001',
    name: 'Open Graph Tags',
    description: 'Page should have Open Graph meta tags for social sharing',
    category: RuleCategory.SOCIAL,
    weight: 7,
  };

  check(context: SeoRuleContext) {
    const ogTitle = context.$('meta[property="og:title"]').attr('content');
    const ogDescription = context.$('meta[property="og:description"]').attr('content');
    const ogImage = context.$('meta[property="og:image"]').attr('content');
    const ogUrl = context.$('meta[property="og:url"]').attr('content');

    const missing = [
      !ogTitle && 'og:title',
      !ogDescription && 'og:description',
      !ogImage && 'og:image',
      !ogUrl && 'og:url',
    ].filter(Boolean);

    if (missing.length === 0) {
      return this.pass('All essential Open Graph tags are present.');
    }

    return this.fail(
      `Missing Open Graph tags: ${missing.join(', ')}.`,
      'minor',
      `Add the missing Open Graph tags to the <head> section: ${missing.join(', ')}.`,
      'Open Graph tags control how your page appears when shared on Facebook, LinkedIn, and other platforms.'
    );
  }
}