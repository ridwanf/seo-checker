import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class TitleExistsRule extends BaseRule {
  metadata = {
    id: 'META001',
    name: 'Title Tag Exists',
    description: 'Page must have a title tag',
    category: RuleCategory.META_TAGS,
    weight: 10,
  };

  check(context: SeoRuleContext) {
    const title = context.$('title').text().trim();
    return title.length > 0
      ? this.pass('Page has a title tag.')
      : this.fail(
        'Page is missing a title tag.',
        'critical',
        'Add a <title> tag inside the <head> section of the page.',
        'The title tag is the most important on-page SEO element. It directly affects rankings and click-through rates.'
      );
  }
}