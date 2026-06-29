import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class RobotsMetaRule extends BaseRule {
  metadata = {
    id: 'robots-meta',
    name: 'Robots Meta Tag',
    description: 'Check robots meta tag for indexability',
    category: RuleCategory.TECHNICAL,
    weight: 8,
  };

  check(context: SeoRuleContext) {
    const robotsMeta = context.$('meta[name="robots"]').attr('content');

    if (!robotsMeta) {
      return this.createCheck(
        true,
        'No robots meta tag (page is indexable by default)',
        undefined
      );
    }

    const content = robotsMeta.toLowerCase();
    const isBlocked = content.includes('noindex') || content.includes('none');

    return this.createCheck(
      !isBlocked,
      isBlocked
        ? `Page is blocked from indexing: ${robotsMeta}`
        : `Robots meta tag: ${robotsMeta}`,
      isBlocked ? 'critical' : undefined,
      isBlocked
        ? 'Remove the "noindex" or "none" directive from the robots meta tag to allow indexing.'
        : undefined,
      isBlocked
        ? 'Blocking indexing prevents search engines from including the page in search results.'
        : undefined
    );
  }
}