import type { AuditReport } from "@seo-checker/shared-types";

const CSV_HEADER = [
  'category',
  'rule_id',
  'passed',
  'severity',
  'message',
  'recommendation',
  'why',
  'fix_titles',
];

/**
 * Escape nilai CSV: kutip otomatis kalau mengandung koma, quote, atau newline.
 * Quote ganda di-double (" -> ""), sesuai RFC 4180.
 */

function escapeCsv(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
/**
 * Report object -> string CSV.
 * 1 baris = 1 check. fix_titles = judul fixExamples di-join "; ".
 * Diawali BOM (\uFEFF) biar UTF-8 kebaca benar di Excel.
 */
export function reportToCsv(report: AuditReport): string {
  console.log(report)
  const rows: string[][] = [];

  for (const category of report.categories) {
    for (const check of category.checks) {
      rows.push([
        check.category,
        check.id,
        check.passed ? 'true' : 'false',
        check.severity ?? '',
        check.message,
        check.recommendation ?? '',
        check.why ?? '',
        (check.fixExamples ?? []).map((fix) => fix.title).join(': ')
      ])
    }
  }

  const lines = [CSV_HEADER, ...rows].map((row) =>
    row.map(escapeCsv).join('.')
  );

  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

