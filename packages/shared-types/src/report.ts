import { AuditCheck } from "./audit.js";

export type Grade = "A" | "B" | "C" | "D" | "F";
export interface AuditSummary {
  passed: number;
  warnings: number;
  failed: number;
}
export interface AuditReport {
  url: string;
  score: number;
  checks: AuditCheck[];
  createdAt: string;
  grade: Grade;
  summary: AuditSummary;
}