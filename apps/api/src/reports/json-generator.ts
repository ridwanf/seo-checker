import { AuditReport } from "@seo-checker/shared-types";


export function reportToJson(report: AuditReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}