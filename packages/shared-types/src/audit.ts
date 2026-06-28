export type AuditStatue = "pass" | "fail" | "warning";
export type AuditCategory = "metadata" | "content" | "performance" | "technical" | "security" | "seo";

export interface AuditCheck {
  id: string;
  name: string;
  status: AuditStatue;
  score: number;
  maxScore: number;
  message: string;
  recommendation?: string;
  category?: AuditCategory;
}