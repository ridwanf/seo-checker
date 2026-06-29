import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class CanonicalRule extends BaseRule {
  metadata = {
    id: 'TECH001',
    name: 'Canonical URL',
    description: 'Page should have a canonical URL',
    category: RuleCategory.TECHNICAL,
    weight: 8,
  };

  check(context: SeoRuleContext) {
    const canonical = context.$('link[rel="canonical"]').attr('href');
    return canonical
      ? this.pass(`Canonical URL is set: ${canonical}`)
      : this.fail(
        'Page is missing a canonical URL.',
        'major',
        'Add <link rel="canonical" href="https://yourdomain.com/page"> to the <head> section.',
        'Canonical tags prevent duplicate content issues by telling search engines which URL is the preferred version.'
      );
  }
}