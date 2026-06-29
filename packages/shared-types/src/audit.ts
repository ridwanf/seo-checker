export interface AuditCheck {
  rule: string;
  passed: boolean;
  message: string;
  severity?: 'critical' | 'major' | 'minor';
  recommendation?: string;
  why?: string;
}