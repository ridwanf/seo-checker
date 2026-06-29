import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class LangAttributeRule extends BaseRule {
  metadata = {
    id: 'TECH003',
    name: 'HTML Lang Attribute',
    description: 'HTML tag should have lang attribute',
    category: RuleCategory.TECHNICAL,
    weight: 7,
  };

  check(context: SeoRuleContext) {
    const lang = context.$('html').attr('lang');
    return lang
      ? this.pass(`HTML lang attribute is set to "${lang}".`)
      : this.fail(
        'HTML tag is missing the lang attribute.',
        'minor',
        'Add a lang attribute to the <html> tag (e.g., <html lang="en">).',
        'The lang attribute helps search engines serve the correct language version and improves accessibility.'
      );
  }
}