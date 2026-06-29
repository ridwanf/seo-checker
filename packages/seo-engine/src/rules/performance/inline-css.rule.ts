import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class InlineCssRule extends BaseRule {
  metadata = {
    id: 'PERF002',
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

    if (totalSize === 0) {
      return this.pass('No inline CSS found.');
    }

    const sizeKb = (totalSize / 1024).toFixed(2);
    const isOptimal = totalSize < 10240; // Less than 10KB

    return isOptimal
      ? this.pass(`Inline CSS size is acceptable (${sizeKb}KB).`)
      : this.fail(
        `Large inline CSS detected (${sizeKb}KB).`,
        'minor',
        'Move inline styles to external CSS files and load them with a <link> tag.',
        'Large inline CSS increases HTML page size, cannot be cached by the browser, and slows down page rendering.'
      );
  }
}