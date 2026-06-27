import { AuditCheck } from "./audit.js";

export type Grade = "A" | "B" | "C" | "D" | "F";
export interface AuditReport {
  url: string;
  score: number;
  checks: AuditCheck[];
  createdAt: string;
  grade: Grade;
}

export function calculateGrade(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}