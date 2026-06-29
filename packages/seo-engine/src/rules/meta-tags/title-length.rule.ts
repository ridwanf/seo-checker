import { RuleCategory } from '@seo-checker/shared-types';
import { SeoRuleContext } from '@seo-checker/shared-types';
import { BaseRule } from "../base-rule";

export class TitleLengthRule extends BaseRule {
  metadata = {
    id: 'title-length',
    name: 'Title Length',
    description: 'Title should be 30-60 characters',
    category: RuleCategory.META_TAGS,
    weight: 8,
  };

  check(context: SeoRuleContext) {
    const title = context.$('title').text().trim();
    const length = title.length;
    const isOptimal = length >= 30 && length <= 60;

    return this.createCheck(
      isOptimal,
      isOptimal
        ? `Title length is optimal (${length} characters)`
        : `Title should be 30-60 characters (current: ${length})`,
      isOptimal ? undefined : 'minor'
    );
  }

}