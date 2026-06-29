import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class MetaDescriptionExistsRule extends BaseRule {
  metadata = {
    id: 'META003',
    name: 'Meta Description Exists',
    description: 'Page must have a meta description',
    category: RuleCategory.META_TAGS,
    weight: 9,
  };

  check(context: SeoRuleContext) {
    const description =
      context.$('meta[name="description"]').attr('content')?.trim() || '';

    return description.length > 0
      ? this.pass('Page has a meta description.')
      : this.fail(
        'Page is missing a meta description.',
        'major',
        'Add a <meta name="description"> tag to the <head> section with a concise summary of the page.',
        'Meta descriptions improve click-through rates by providing a summary of the page content in search results.'
      );
  }
}