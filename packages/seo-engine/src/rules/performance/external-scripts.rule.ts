import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class ExternalScriptsRule extends BaseRule {
  metadata = {
    id: 'external-scripts',
    name: 'External Scripts',
    description: 'External scripts should use async or defer',
    category: RuleCategory.PERFORMANCE,
    weight: 5,
  };

  check(context: SeoRuleContext) {
    const externalScripts = context.$('script[src]');
    let blockingScripts = 0;

    externalScripts.each((_: number, elem: any) => {
      const $elem = context.$(elem);
      const hasAsync = $elem.attr('async') !== undefined;
      const hasDefer = $elem.attr('defer') !== undefined;

      if (!hasAsync && !hasDefer) {
        blockingScripts++;
      }
    });

    if (externalScripts.length === 0) {
      return this.createCheck(true, 'No external scripts found', undefined);
    }

    const passed = blockingScripts === 0;
    return this.createCheck(
      passed,
      passed
        ? `All ${externalScripts.length} external scripts use async/defer`
        : `${blockingScripts} of ${externalScripts.length} scripts are render-blocking`,
      passed ? undefined : 'minor'
    );
  }
}