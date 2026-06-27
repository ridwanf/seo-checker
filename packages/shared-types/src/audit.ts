export type CheckStatus = "pass" | "fail" | "warning";
export type Category = "metadata" | "content" | "performance" | "technical" | "security" | "seo";

export interface AuditCheck {
  id: string;
  name: string;
  status: CheckStatus;
  score: number;
  maxScore: number;
  message: string;
  recommendation?: string;
  category?: Category;
}