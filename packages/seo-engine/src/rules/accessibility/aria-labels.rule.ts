import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class AriaLabelsRule extends BaseRule {
  metadata = {
    id: 'ACC001',
    name: 'ARIA Labels',
    description: 'Interactive elements should have ARIA labels',
    category: RuleCategory.ACCESSIBILITY,
    weight: 5,
  };

  check(context: SeoRuleContext) {
    const buttons = context.$('button, a[role="button"]');
    const total = buttons.length;

    if (total === 0) {
      return this.pass('No interactive elements found.');
    }

    let missing = 0;
    buttons.each((_: number, elem: any) => {
      const $elem = context.$(elem);
      if (!$elem.attr('aria-label') && !$elem.text().trim()) missing++;
    });

    return missing === 0
      ? this.pass(`All ${total} interactive elements have labels.`)
      : this.fail(
        `${missing} of ${total} interactive elements are missing labels.`,
        'minor',
        'Add aria-label attributes or visible text to all buttons and interactive links.',
        'ARIA labels are used by screen readers to describe interactive elements to visually impaired users.'
      );
  }
}