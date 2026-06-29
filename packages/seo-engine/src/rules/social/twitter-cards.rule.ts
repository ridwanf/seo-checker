import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class TwitterCardsRule extends BaseRule {
  metadata = {
    id: 'SOC002',
    name: 'Twitter Card Tags',
    description: 'Page should have Twitter Card meta tags',
    category: RuleCategory.SOCIAL,
    weight: 6,
  };

  check(context: SeoRuleContext) {
    const twitterCard = context.$('meta[name="twitter:card"]').attr('content');
    const twitterTitle = context.$('meta[name="twitter:title"]').attr('content');
    const twitterImage = context.$('meta[name="twitter:image"]').attr('content');

    const missing = [
      !twitterCard && 'twitter:card',
      !twitterTitle && 'twitter:title',
      !twitterImage && 'twitter:image',
    ].filter(Boolean);

    if (missing.length === 0) {
      return this.pass(`Twitter Card configured: "${twitterCard}".`);
    }

    return this.fail(
      `Missing Twitter Card tags: ${missing.join(', ')}.`,
      'minor',
      `Add the missing Twitter Card tags to the <head>: ${missing.join(', ')}.`,
      'Twitter uses these tags to generate rich previews when your page is shared on Twitter/X.'
    );
  }
}