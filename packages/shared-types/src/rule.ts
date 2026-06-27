import { AuditCheck } from "./audit.js";

export interface SeoRuleContext {
  url: string;
  html: string;
}

export interface SeoRule {
  id: string;
  name: string;
  weight: number;
  execute(context: SeoRuleContext): Promise<AuditCheck>;
}