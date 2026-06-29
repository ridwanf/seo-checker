import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class MetaDescriptionLengthRule extends BaseRule {
  metadata = {
    id: 'meta-description-length',
    name: 'Meta Description Length',
    description: 'Meta description should be 120-160 characters',
    category: RuleCategory.META_TAGS,
    weight: 7,
  };

  check(context: SeoRuleContext) {
    const description =
      context.$('meta[name="description"]').attr('content')?.trim() || '';

    return this.createCheck(
      description.length > 0,
      description.length > 0
        ? 'Page has a meta description.'
        : 'Page is missing a meta description.',
      description.length > 0 ? undefined : 'major',
      description.length > 0
        ? undefined
        : 'Add a <meta name="description"> tag to the <head> section with a concise summary of the page.',
      description.length > 0
        ? undefined
        : 'Meta descriptions improve click-through rates by providing a summary of the page in search results.'
    );
  }
}