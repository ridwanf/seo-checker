import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class AriaLabelsRule extends BaseRule {
  metadata = {
    id: 'aria-labels',
    name: 'ARIA Labels',
    description: 'Interactive elements should have ARIA labels',
    category: RuleCategory.ACCESSIBILITY,
    weight: 5,
  };

  check(context: SeoRuleContext) {
    const buttons = context.$('button, a[role="button"]');
    let missingLabel = 0;

    buttons.each((_: number, elem: any) => {
      const $elem = context.$(elem);
      const ariaLabel = $elem.attr('aria-label');
      const text = $elem.text().trim();

      if (!ariaLabel && !text) {
        missingLabel++;
      }
    });

    if (buttons.length === 0) {
      return this.createCheck(true, 'No interactive elements found', undefined,);
    }

    const passed = missingLabel === 0;
    return this.createCheck(
      passed,
      passed
        ? `All ${buttons.length} interactive elements have labels`
        : `${missingLabel} of ${buttons.length} interactive elements are missing labels`,
      passed ? undefined : 'minor',
      passed
        ? undefined
        : 'Add ARIA labels or visible text to all interactive elements.',
      passed
        ? undefined
        : 'ARIA labels improve accessibility by providing assistive technologies with descriptions of interactive elements.'
    );
  }
}