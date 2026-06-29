import {
  SeoRule,
  SeoRuleContext,
  AuditCheck,
  RuleMetadata,
} from '@seo-checker/shared-types';

export abstract class BaseRule implements SeoRule {
  abstract metadata: RuleMetadata;

  abstract check(context: SeoRuleContext): AuditCheck | Promise<AuditCheck>;

  protected pass(message: string): AuditCheck {
    return {
      id: this.metadata.id,
      rule: this.metadata.name,
      category: this.metadata.category,
      passed: true,
      message,
    };
  }

  protected fail(
    message: string,
    severity: 'critical' | 'major' | 'minor',
    recommendation: string, // Always required for failed checks
    why: string // Always required for failed checks
  ): AuditCheck {
    return {
      id: this.metadata.id,
      rule: this.metadata.name,
      category: this.metadata.category,
      passed: false,
      message,
      severity,
      recommendation,
      why,
    };
  }
}