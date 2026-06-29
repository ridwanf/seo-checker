import { RuleCategory, SeoRuleContext } from "@seo-checker/shared-types";
import { BaseRule } from "../base-rule";

export class HttpsRule extends BaseRule {
  metadata = {
    id: 'https-protocol',
    name: 'HTTPS Protocol',
    description: 'Page should use HTTPS',
    category: RuleCategory.TECHNICAL,
    weight: 9,
  };

  check(context: SeoRuleContext) {
    const isHttps = context.url.startsWith('https://');

    return this.createCheck(
      isHttps,
      isHttps ? 'Page uses HTTPS protocol' : 'Page should use HTTPS protocol',
      isHttps ? 'major' : 'critical'
    );
  }
}