import { AuditCheck } from "./audit.js";
import { CheerioAPI } from "cheerio";
export interface SeoRuleContext {
  url: string;
  html: string;
  $: CheerioAPI;
}

export interface SeoRule {
  id: string;
  name: string;
  weight: number;
  execute(context: SeoRuleContext): Promise<AuditCheck>;
}