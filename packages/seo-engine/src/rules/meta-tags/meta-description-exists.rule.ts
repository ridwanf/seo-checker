import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class MetaDescriptionExistsRule extends BaseRule {
  metadata = {
    id: 'meta-description-exists',
    name: 'Meta Description Exists',
    description: 'Page must have a meta description',
    category: RuleCategory.META_TAGS,
    weight: 9,
  };

  check(context: SeoRuleContext) {
    const description =
      context.$('meta[name="description"]').attr('content')?.trim() || '';

    return this.createCheck(
      description.length > 0,
      description.length > 0
        ? 'Page has a meta description'
        : 'Page is missing a meta description',
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