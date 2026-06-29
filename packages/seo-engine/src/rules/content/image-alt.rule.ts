import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class ImageAltRule extends BaseRule {
  metadata = {
    id: 'CON002',
    name: 'Image Alt Text',
    description: 'All images should have alt text',
    category: RuleCategory.CONTENT,
    weight: 7,
  };

  check(context: SeoRuleContext) {
    const images = context.$('img');
    const totalImages = images.length;

    if (totalImages === 0) {
      return this.pass('No images found on page.');
    }

    let missingAlt = 0;
    images.each((_: number, img: any) => {
      const alt = context.$(img).attr('alt');
      if (alt === undefined || alt.trim() === '') missingAlt++;
    });

    return missingAlt === 0
      ? this.pass(`All ${totalImages} images have alt text.`)
      : this.fail(
        `${missingAlt} of ${totalImages} images are missing alt text.`,
        'minor',
        'Add descriptive alt attributes to all <img> tags.',
        'Alt text helps search engines understand image content and improves accessibility for visually impaired users.'
      );
  }
}