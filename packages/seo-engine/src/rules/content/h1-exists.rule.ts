import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class H1ExistsRule extends BaseRule {
  metadata = {
    id: 'CON001',
    name: 'H1 Heading Exists',
    description: 'Page should have exactly one H1 heading',
    category: RuleCategory.CONTENT,
    weight: 9,
  };

  check(context: SeoRuleContext) {
    const h1Elements = context.$('h1');
    const count = h1Elements.length;

    if (count === 0) {
      return this.fail(
        'Page is missing an H1 heading.',
        'critical',
        'Add a single H1 heading that clearly describes the main topic of the page.',
        'The H1 heading signals the primary topic to search engines and is a key on-page SEO element.'
      );
    }

    if (count > 1) {
      return this.fail(
        `Page has ${count} H1 headings. Only one is recommended.`,
        'major',
        'Keep only one H1 heading per page. Demote the others to H2 or H3.',
        'Multiple H1 headings dilute the relevance signal and can confuse search engines about the primary topic.'
      );
    }

    const h1Text = h1Elements.first().text().trim();
    return this.pass(
      `Page has one H1 heading: "${h1Text.substring(0, 50)}${h1Text.length > 50 ? '...' : ''}".`
    );
  }
}