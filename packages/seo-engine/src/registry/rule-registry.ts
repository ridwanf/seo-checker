import { RuleCategory, SeoRule } from "@seo-checker/shared-types";

export class RuleRegistry {
  private rules: Map<string, any> = new Map();

  register(rule: SeoRule): void {
    this.rules.set(rule.metadata.id, rule);
  }

  registerMany(rules: SeoRule[]): void {
    rules.forEach((rule) => this.register(rule));
  }

  getAll(): SeoRule[] {
    return Array.from(this.rules.values());
  }

  getByCategory(category: string): SeoRule[] {
    return Array.from(this.rules.values()).filter(
      (rule) => rule.metadata.category === category
    );
  }

  getById(id: string): SeoRule | undefined {
    return this.rules.get(id);
  }

  getTotalWeight(): number {
    return Array.from(this.rules.values()).reduce(
      (total, rule) => total + rule.metadata.weight,
      0
    );
  }

  getCategoryWeight(category: RuleCategory): number {
    return this.getByCategory(category).reduce(
      (sum, rule) => sum + rule.metadata.weight,
      0
    );
  }
}