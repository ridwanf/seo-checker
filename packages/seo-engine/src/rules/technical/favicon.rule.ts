import { AuditCheck, RuleCategory, SeoRuleContext } from "@seo-checker/shared-types";
import { BaseRule } from "../base-rule";

export class FaviconRule extends BaseRule {
  metadata = {
    id: 'favicon',
    name: 'Favicon',
    description: 'Page should have a favicon for branding and user experience',
    category: RuleCategory.TECHNICAL,
    weight: 4,
  };

  check(context: SeoRuleContext): AuditCheck | Promise<AuditCheck> {
    const favicon =
      context.$('link[rel="icon"]').attr('href') ||
      context.$('link[rel="shortcut icon"]').attr('href');

    return this.createCheck(
      !!favicon,
      favicon ? `Favicon found: ${favicon}` : 'No favicon found',
      'minor'
    );
  }
}