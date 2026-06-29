import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class TitleLengthRule extends BaseRule {
  metadata = {
    id: 'META002',
    name: 'Title Length',
    description: 'Title should be between 30 and 60 characters',
    category: RuleCategory.META_TAGS,
    weight: 8,
  };

  check(context: SeoRuleContext) {
    const title = context.$('title').text().trim();
    const length = title.length;
    const isOptimal = length >= 30 && length <= 60;

    return isOptimal
      ? this.pass(`Title length is optimal (${length} characters).`)
      : this.fail(
        `Title length is ${length} characters. Optimal is 30–60.`,
        'minor',
        'Rewrite the title to be between 30 and 60 characters.',
        'Titles that are too short may not rank for enough keywords. Titles that are too long get truncated in search results.'
      );
  }
}