import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class ExternalScriptsRule extends BaseRule {
  metadata = {
    id: 'PERF001',
    name: 'External Scripts',
    description: 'External scripts should use async or defer',
    category: RuleCategory.PERFORMANCE,
    weight: 5,
  };

  check(context: SeoRuleContext) {
    const externalScripts = context.$('script[src]');
    const total = externalScripts.length;

    if (total === 0) {
      return this.pass('No external scripts found.');
    }

    let blockingScripts = 0;
    externalScripts.each((_: number, elem: any) => {
      const $elem = context.$(elem);
      const hasAsync = $elem.attr('async') !== undefined;
      const hasDefer = $elem.attr('defer') !== undefined;
      if (!hasAsync && !hasDefer) blockingScripts++;
    });

    return blockingScripts === 0
      ? this.pass(`All ${total} external scripts use async or defer.`)
      : this.fail(
        `${blockingScripts} of ${total} external scripts are render-blocking.`,
        'minor',
        'Add async or defer attribute to all external <script> tags.',
        'Render-blocking scripts delay page load by preventing the browser from parsing HTML until the script finishes downloading and executing.'
      );
  }
}