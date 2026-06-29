import {
  SeoRule,
  SeoRuleContext,
  AuditCheck,
  RuleMetadata,
} from '@seo-checker/shared-types';

export abstract class BaseRule implements SeoRule {
  abstract metadata: RuleMetadata;

  abstract check(context: SeoRuleContext): AuditCheck | Promise<AuditCheck>;

  protected createCheck(
    passed: boolean,
    message: string,
    severity: 'critical' | 'major' | 'minor' = 'critical',
    recommendation?: string,
    why?: string
  ): AuditCheck {
    return {
      rule: this.metadata.id,
      passed,
      message,
      ...(passed ? {} : { severity, recommendation, why }),
    };
  }
}