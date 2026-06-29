import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class HeadingStructureRule extends BaseRule {
  metadata = {
    id: 'CON003',
    name: 'Heading Hierarchy',
    description: 'Headings should follow a proper hierarchy',
    category: RuleCategory.CONTENT,
    weight: 6,
  };

  check(context: SeoRuleContext) {
    const headings: { level: number }[] = [];

    for (let i = 1; i <= 6; i++) {
      context.$(`h${i}`).each(() => {
        headings.push({ level: i });
      });
    }

    if (headings.length === 0) {
      return this.fail(
        'No headings found on the page.',
        'major',
        'Add headings (H1–H6) to structure your content clearly.',
        'Headings help search engines understand the structure and hierarchy of your content.'
      );
    }

    let previousLevel = 0;
    for (const heading of headings) {
      if (heading.level > previousLevel + 1 && previousLevel !== 0) {
        return this.fail(
          `Heading hierarchy skips from H${previousLevel} to H${heading.level}.`,
          'minor',
          'Ensure headings follow a sequential order (H1 → H2 → H3).',
          'Skipping heading levels can confuse search engines and makes content harder to navigate for screen readers.'
        );
      }
      previousLevel = heading.level;
    }

    return this.pass(`Proper heading hierarchy with ${headings.length} headings.`);
  }
}