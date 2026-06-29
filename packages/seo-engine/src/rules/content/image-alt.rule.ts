import { SeoRuleContext, RuleCategory } from '@seo-checker/shared-types';
import { BaseRule } from '../base-rule';

export class ImageAltRule extends BaseRule {
  metadata = {
    id: 'image-alt-text',
    name: 'Image Alt Text',
    description: 'All images should have alt text',
    category: RuleCategory.CONTENT,
    weight: 7,
  };

  check(context: SeoRuleContext) {
    const images = context.$('img');
    const totalImages = images.length;

    if (totalImages === 0) {
      return this.createCheck(true, 'No images found on page', undefined);
    }

    let missingAlt = 0;
    images.each((_: number, img: any) => {
      const alt = context.$(img).attr('alt');
      if (!alt || alt.trim() === '') {
        missingAlt++;
      }
    });

    const passed = missingAlt === 0;
    return this.createCheck(
      passed,
      passed
        ? `All ${totalImages} images have alt text`
        : `${missingAlt} of ${totalImages} images missing alt text`,
      passed ? undefined : 'minor'
    );
  }
}