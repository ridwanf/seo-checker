import {
  AuditCheck,
  RuleCategory,
  SeoRuleContext,
} from '@seo-checker/shared-types';

import { BaseRule } from '../base-rule';

export class H1ExistsRule
  extends BaseRule {
  metadata = {
    id: 'h1-exists',
    name: 'H1 Heading Exists',
    description: 'Page should have exactly one H1 heading',
    category: RuleCategory.CONTENT,
    weight: 9,
  };

  check(context: SeoRuleContext) {
    const h1Elements = context.$('h1');
    const count = h1Elements.length;

    if (count === 0) {
      return this.createCheck(
        false,
        'Page is missing an H1 heading',
        'critical',
        'Add an H1 heading to the page to describe its main topic.',
        'The H1 heading is critical for SEO as it helps search engines understand the primary topic of the page.'
      );
    }

    if (count > 1) {
      return this.createCheck(
        false,
        `Page has ${count} H1 headings, but it should have exactly one.`,
        'major',
        'Ensure the page has only one H1 heading to avoid confusing search engines.',
        'Multiple H1 headings can dilute the focus of the page and confuse search engines about its main topic.'
      );
    }

    const h1Text = h1Elements.first().text().trim();
    return this.createCheck(
      true,
      `Page has one H1 heading: "${h1Text.substring(0, 50)}${h1Text.length > 50 ? '...' : ''}"`,
      undefined
    );
  }
}