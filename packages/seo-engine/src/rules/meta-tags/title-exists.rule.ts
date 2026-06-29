import {
  RuleCategory,
  SeoRuleContext,
} from '@seo-checker/shared-types';

import { BaseRule } from '../base-rule';

export class TitleExistsRule extends BaseRule {

  metadata = {
    id: 'title-exists',
    name: 'Title Tag Exists',
    description: 'Page must have a title tag',
    category: RuleCategory.META_TAGS,
    weight: 10,
  };

  check(context: SeoRuleContext) {
    const title = context.$('title').text().trim();
    return this.createCheck(
      title.length > 0,
      title.length > 0
        ? 'Page has a title tag'
        : 'Page is missing a title tag',
      title.length > 0 ? undefined : 'critical',
      title.length > 0
        ? undefined
        : 'Add a <title> tag to the <head> section of the page.',
      title.length > 0
        ? undefined
        : 'The title tag is critical for SEO as it helps search engines understand the page content.'
    );
  }
}