import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class RobotsMetaRule extends BaseRule {
  metadata = {
    id: 'TECH005',
    name: 'Robots Meta Tag',
    description: 'Check robots meta tag for indexability',
    category: RuleCategory.TECHNICAL,
    weight: 8,
  };

  check(context: SeoRuleContext) {
    const robotsMeta = context.$('meta[name="robots"]').attr('content');

    if (!robotsMeta) {
      return this.pass('No robots meta tag — page is indexable by default.');
    }

    const content = robotsMeta.toLowerCase();
    const isBlocked = content.includes('noindex') || content.includes('none');

    return isBlocked
      ? this.fail(
        `Page is blocked from indexing: "${robotsMeta}".`,
        'critical',
        'Remove the "noindex" directive unless you intentionally want to hide this page from search engines.',
        'A noindex directive tells search engines not to include this page in search results, which will remove it from Google.'
      )
      : this.pass(`Robots meta tag is set to "${robotsMeta}" — page is indexable.`);
  }
}