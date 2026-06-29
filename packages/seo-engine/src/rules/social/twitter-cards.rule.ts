import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class TwitterCardsRule extends BaseRule {
  metadata = {
    id: 'twitter-cards',
    name: 'Twitter Card Tags',
    description: 'Page should have Twitter Card meta tags',
    category: RuleCategory.SOCIAL,
    weight: 6,
  };

  check(context: SeoRuleContext) {
    const twitterCard = context.$('meta[name="twitter:card"]').attr('content');

    return this.createCheck(
      !!twitterCard,
      twitterCard
        ? `Twitter Card configured: ${twitterCard}`
        : 'No Twitter Card tags found',
      twitterCard ? undefined : 'minor',
      twitterCard
        ? undefined
        : 'Add Twitter Card meta tags to improve social sharing previews.',
      twitterCard
        ? undefined
        : 'Twitter uses these tags to generate rich previews when your page is shared.'
    );
  }
}