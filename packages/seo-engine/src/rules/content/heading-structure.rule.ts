import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class HeadingStructureRule extends BaseRule {
  metadata = {
    id: 'heading-structure',
    name: 'Heading Hierarchy',
    description: 'Headings should follow proper hierarchy (H1 → H2 → H3)',
    category: RuleCategory.CONTENT,
    weight: 6,
  };

  check(context: SeoRuleContext) {
    const headings: { level: number; text: string }[] = [];

    for (let i = 1; i <= 6; i++) {
      context.$(`h${i}`).each((_: number, elem: any) => {
        headings.push({
          level: i,
          text: context.$(elem).text().trim(),
        });
      });
    }

    if (headings.length === 0) {
      return this.createCheck(
        false,
        'No headings found on the page.',
        'major',
        'Add headings (H1, H2, etc.) to structure the content of the page.',
        'Headings improve readability and help search engines understand the structure of the content.'
      );
    }

    // Check for hierarchy issues
    let previousLevel = 0;
    for (const heading of headings) {
      if (heading.level > previousLevel + 1 && previousLevel !== 0) {
        return this.createCheck(
          false,
          `Heading hierarchy skips from H${previousLevel} to H${heading.level}.`,
          'minor',
          'Ensure headings follow a proper hierarchy (e.g., H1 → H2 → H3).',
          'Improper heading hierarchy can confuse search engines and reduce content readability.'
        );
      }
      previousLevel = heading.level;
    }

    return this.createCheck(
      true,
      `Proper heading hierarchy with ${headings.length} headings.`,
      undefined
    );
  }
}