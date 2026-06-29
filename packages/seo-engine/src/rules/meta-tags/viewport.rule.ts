import { AuditCheck, RuleCategory, SeoRuleContext } from "@seo-checker/shared-types";
import { BaseRule } from "../base-rule";

export class ViewportRule extends BaseRule {
  metadata = {
    id: 'viewport-meta',
    name: 'Viewport Meta Tag',
    description: 'Page should have viewport meta tag for mobile responsiveness',
    category: RuleCategory.META_TAGS,
    weight: 8,
  };

  check(context: SeoRuleContext): AuditCheck | Promise<AuditCheck> {
    const viewport = context.$('meta[name="viewport"]').attr('content')?.trim() || '';

    return this.createCheck(
      !!viewport,
      viewport
        ? `Viewport meta tag is present: ${viewport}`
        : 'Missing viewport meta tag for mobile responsiveness',
      'minor'
    );
  }
}