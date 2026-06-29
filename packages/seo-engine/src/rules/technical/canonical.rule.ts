import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class CanonicalRule extends BaseRule {
  metadata = {
    id: 'canonical-url',
    name: 'Canonical URL',
    description: 'Page should have a canonical URL',
    category: RuleCategory.TECHNICAL,
    weight: 8,
  };

  check(context: SeoRuleContext) {
    const canonical = context.$('link[rel="canonical"]').attr('href');

    return this.createCheck(
      !!canonical,
      canonical
        ? `Canonical URL is set: ${canonical}`
        : 'Page is missing a canonical URL',
      canonical ? undefined : 'major',
      canonical
        ? undefined
        : 'Add a canonical tag in the <head> pointing to the preferred URL.',
      canonical
        ? undefined
        : 'Canonical tags help search engines understand the preferred version of a page.'
    );
  }
}