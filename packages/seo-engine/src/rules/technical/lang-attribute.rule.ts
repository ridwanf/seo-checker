import { RuleCategory, SeoRuleContext } from "@seo-checker/shared-types";
import { BaseRule } from "../base-rule";

export class LangAttributeRule extends BaseRule {
  metadata = {
    id: 'html-lang',
    name: 'Lang Attribute',
    description: 'Page should have a lang attribute for accessibility and SEO',
    category: RuleCategory.TECHNICAL,
    weight: 8,
  };

  check(context: SeoRuleContext) {
    const lang = context.$('html').attr('lang');

    return this.createCheck(
      !!lang,
      lang
        ? `Lang attribute is set: ${lang}`
        : 'Page is missing a lang attribute for accessibility and SEO',
      'minor'
    );
  }
}