import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class InlineCssRule extends BaseRule {
  metadata = {
    id: 'inline-css-size',
    name: 'Inline CSS Size',
    description: 'Inline CSS should be minimized',
    category: RuleCategory.PERFORMANCE,
    weight: 4,
  };

  check(context: SeoRuleContext) {
    let totalSize = 0;
    context.$('style').each((_: number, elem: any) => {
      totalSize += context.$(elem).html()?.length || 0;
    });

    const sizeKb = (totalSize / 1024).toFixed(2);
    const isOptimal = totalSize < 10240; // Less than 10KB

    return this.createCheck(
      isOptimal,
      isOptimal
        ? `Inline CSS size is acceptable (${sizeKb}KB)`
        : `Large inline CSS detected (${sizeKb}KB), consider external stylesheets`,
      isOptimal ? undefined : 'minor'
    );
  }
}