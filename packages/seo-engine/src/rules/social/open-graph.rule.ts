import { RuleCategory, SeoRuleContext } from "@seo-checker/shared-types";
import { BaseRule } from "../base-rule";

export class OpenGraphRule extends BaseRule {
  metadata = {
    id: 'open-graph',
    name: 'Open Graph Tags',
    description: 'Page should have Open Graph meta tags for social sharing',
    category: RuleCategory.SOCIAL,
    weight: 7,
  }

  check(context: SeoRuleContext) {
    const ogTitle = context.$('meta[property="og:title"]').attr('content');
    const ogDescription = context.$('meta[property="og:description"]').attr('content');
    const ogImage = context.$('meta[property="og:image"]').attr('content');
    const ogUrl = context.$('meta[property="og:url"]').attr('content');

    const present = [ogTitle, ogDescription, ogImage, ogUrl].filter(Boolean);

    if (present.length === 0) {
      return this.createCheck(
        false,
        'No Open Graph tags found.',
        'minor',
        'Add Open Graph meta tags (og:title, og:description, og:image, og:url) to improve social sharing previews.',
        'Open Graph tags allow social media platforms to display rich previews of your page when shared.'
      );
    }

    if (present.length < 4) {
      const missing = [];
      if (!ogTitle) missing.push('og:title');
      if (!ogDescription) missing.push('og:description');
      if (!ogImage) missing.push('og:image');
      if (!ogUrl) missing.push('og:url');

      return this.createCheck(
        false,
        `Incomplete Open Graph tags. Missing: ${missing.join(', ')}`,
        'minor',
        'Add the missing Open Graph tags to ensure complete social sharing previews.',
        'Incomplete Open Graph tags can result in poor or inconsistent previews on social media platforms.'
      );
    }

    return this.createCheck(
      true,
      'All essential Open Graph tags are present.',
      undefined
    );
  }
}