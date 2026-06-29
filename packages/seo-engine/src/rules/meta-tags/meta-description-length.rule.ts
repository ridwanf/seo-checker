import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class MetaDescriptionLengthRule extends BaseRule {
  metadata = {
    id: 'META004',
    name: 'Meta Description Length',
    description: 'Meta description should be between 120 and 160 characters',
    category: RuleCategory.META_TAGS,
    weight: 7,
  };

  check(context: SeoRuleContext) {
    const description =
      context.$('meta[name="description"]').attr('content')?.trim() || '';
    const length = description.length;
    const isOptimal = length >= 120 && length <= 160;

    return isOptimal
      ? this.pass(`Meta description length is optimal (${length} characters).`)
      : this.fail(
        `Meta description is ${length} characters. Optimal is 120–160.`,
        'minor',
        'Rewrite the meta description to be between 120 and 160 characters.',
        'Descriptions that are too short are less persuasive. Descriptions that are too long get truncated in search results.'
      );
  }
}