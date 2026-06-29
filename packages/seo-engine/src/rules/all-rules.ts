import { SeoRule } from '@seo-checker/shared-types';
import {
  TitleExistsRule,
  TitleLengthRule,
  MetaDescriptionExistsRule,
  MetaDescriptionLengthRule,
  ViewportRule,
} from './meta-tags';
import {
  H1ExistsRule,
  ImageAltRule,
  HeadingStructureRule,
} from './content';
import {
  CanonicalRule,
  LangAttributeRule,
  FaviconRule,
  HttpsRule,
  RobotsMetaRule,
} from './technical';
import {
  OpenGraphRule,
  TwitterCardsRule,
} from './social';
import {
  AriaLabelsRule,
} from './accessibility';
import {
  InlineCssRule,
  ExternalScriptsRule,
} from './performance';

export function createAllRules(): SeoRule[] {
  return [
    // Meta Tags (Weight: 42)
    new TitleExistsRule(),
    new TitleLengthRule(),
    new MetaDescriptionExistsRule(),
    new MetaDescriptionLengthRule(),
    new ViewportRule(),

    // Content (Weight: 22)
    new H1ExistsRule(),
    new ImageAltRule(),
    new HeadingStructureRule(),

    // Technical (Weight: 36)
    new CanonicalRule(),
    new LangAttributeRule(),
    new FaviconRule(),
    new HttpsRule(),
    new RobotsMetaRule(),

    // Social (Weight: 13)
    new OpenGraphRule(),
    new TwitterCardsRule(),

    // Accessibility (Weight: 5)
    new AriaLabelsRule(),

    // Performance (Weight: 9)
    new InlineCssRule(),
    new ExternalScriptsRule(),
  ];
}