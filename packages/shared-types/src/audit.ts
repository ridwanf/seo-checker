import { RuleCategory } from "./rule";

export interface FixExample {
  title: string;
  before?: string;
  after?: string;
  explanation?: string;
}

export interface AuditCheck {
  id: string;
  rule: string;
  category: RuleCategory;
  passed: boolean;
  message: string;
  severity?: 'critical' | 'major' | 'minor';
  recommendation?: string;
  why?: string;
  fixExamples?: FixExample[];
}