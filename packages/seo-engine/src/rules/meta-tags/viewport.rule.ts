import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class ViewportRule extends BaseRule {
  metadata = {
    id: 'META005',
    name: 'Viewport Meta Tag',
    description: 'Page should have a viewport meta tag for mobile responsiveness',
    category: RuleCategory.META_TAGS,
    weight: 8,
  };

  check(context: SeoRuleContext) {
    const viewport = context.$('meta[name="viewport"]').attr('content');

    return viewport
      ? this.pass(`Viewport meta tag is present: "${viewport}".`)
      : this.fail(
        'Missing viewport meta tag.',
        'major',
        'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the <head> section.',
        'Without a viewport meta tag, mobile devices render pages at desktop widths. Google uses mobile-first indexing.'
      );
  }
}