import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class HttpsRule extends BaseRule {
  metadata = {
    id: 'TECH002',
    name: 'HTTPS Protocol',
    description: 'Page should use HTTPS',
    category: RuleCategory.TECHNICAL,
    weight: 10,
  };

  check(context: SeoRuleContext) {
    const isHttps = context.crawl.finalUrl.startsWith('https://');
    return isHttps
      ? this.pass('Page uses HTTPS protocol.')
      : this.fail(
        'Page is not using HTTPS.',
        'critical',
        'Install an SSL certificate and redirect all HTTP traffic to HTTPS.',
        'HTTPS is a confirmed Google ranking factor and protects user data in transit.'
      );
  }
}