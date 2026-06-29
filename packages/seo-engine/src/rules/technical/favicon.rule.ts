import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class FaviconRule extends BaseRule {
  metadata = {
    id: 'TECH004',
    name: 'Favicon',
    description: 'Page should have a favicon',
    category: RuleCategory.TECHNICAL,
    weight: 4,
  };

  check(context: SeoRuleContext) {
    const favicon =
      context.$('link[rel="icon"]').attr('href') ||
      context.$('link[rel="shortcut icon"]').attr('href');

    return favicon
      ? this.pass(`Favicon found: ${favicon}`)
      : this.fail(
        'No favicon found.',
        'minor',
        'Add <link rel="icon" href="/favicon.ico"> to the <head> section.',
        'Favicons improve brand recognition and appear in browser tabs, bookmarks, and search results.'
      );
  }
}