import PDFDocument from 'pdfkit';
import type { AuditReport } from '@seo-checker/shared-types';

// ---------- Konfigurasi layout ----------
const PAGE_WIDTH = 595.28; // A4 (points)
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FONT = 'Helvetica';
const FONT_BOLD = 'Helvetica-Bold';

const C = {
  dark: '#1f2937',
  muted: '#6b7280',
  primary: '#0ea5e9',
  pass: '#059669',
  fail: '#dc2626',
  warn: '#d97706',
  border: '#e5e7eb',
  headerBg: '#f3f4f6',
  zebra: '#fafafa',
};

const CATEGORY_LABELS: Record<string, string> = {
  'meta-tags': 'Meta Tags',
  content: 'Content',
  technical: 'Technical',
  social: 'Social',
  performance: 'Performance',
  accessibility: 'Accessibility',
};

// ---------- Helpers ----------
function formatDate(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Potong teks panjang (biar footer URL gak bikin pdfkit infinite loop). */
function truncate(text: string, maxLen: number): string {
  const s = String(text ?? '');
  return s.length > maxLen ? `${s.slice(0, maxLen - 3)}...` : s;
}

/** Pecah teks jadi baris-baris yang muat di maxWidth. */
function wrapText(doc: PDFKit.PDFDocument, text: string, maxWidth: number): string[] {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return [''];
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && doc.widthOfString(candidate) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  lines.push(current);
  return lines;
}

function scoreColor(score: number): string {
  if (score >= 90) return C.pass;
  if (score >= 80) return C.primary;
  if (score >= 70) return C.warn;
  return C.fail;
}

// ---------- Tabel sederhana ----------
interface TableRow {
  cells: string[];
  cellColors?: Array<string | undefined>;
}

interface TableOptions {
  headers: string[];
  widths: number[];
  rows: TableRow[];
  y: number;
  fontSize?: number;
  /** Index kolom yang dirender sebagai badge pill (mis. kolom Status). */
  badgeColumn?: number;
}

/** Hitung tinggi tabel (header + semua baris) tanpa menggambar. */
function measureTable(doc: PDFKit.PDFDocument, opts: TableOptions): number {
  const { widths, rows, fontSize = 8 } = opts;
  const padX = 5;
  const padY = 4;
  const lineHeight = fontSize + 2;
  const headerHeight = 18;

  const rowHeights = rows.map((row) => {
    const heights = row.cells.map((cell, i) => {
      const lines = wrapText(doc, cell, widths[i] - padX * 2);
      return Math.max(lines.length * lineHeight + padY * 2, headerHeight);
    });
    return Math.max(...heights);
  });

  const total = rowHeights.reduce((acc, h) => acc + h, headerHeight);
  return total;
}

/** Gambar tabel + grid + zebra, auto pindah halaman. Return y terakhir. */
function renderTable(doc: PDFKit.PDFDocument, opts: TableOptions): number {
  const { headers, widths, rows, y: startY = MARGIN, fontSize = 8 } = opts;
  const padX = 5;
  const padY = 4;
  const lineHeight = fontSize + 2;
  const headerHeight = 18;
  let y = startY;

  const ensureSpace = (needed: number) => {
    if (y + needed > doc.page.height - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  // Ukur tinggi tiap baris berdasarkan isi cell yang di-wrap
  const rowHeights = rows.map((row) => {
    const heights = row.cells.map((cell, i) => {
      const lines = wrapText(doc, cell, widths[i] - padX * 2);
      return Math.max(lines.length * lineHeight + padY * 2, headerHeight);
    });
    return Math.max(...heights);
  });

  // Header
  ensureSpace(headerHeight);
  doc.rect(MARGIN, y, CONTENT_WIDTH, headerHeight).fill(C.headerBg);
  let x = MARGIN;
  headers.forEach((header, i) => {
    doc.font(FONT_BOLD).fontSize(fontSize).fillColor(C.dark);
    doc.text(header, x + padX, y + (headerHeight - fontSize) / 2, {
      width: widths[i] - padX * 2,
      lineBreak: false,
      ellipsis: true,
    });
    x += widths[i];
  });
  y += headerHeight;

  // Isi baris
  rows.forEach((row, rIdx) => {
    const h = rowHeights[rIdx];
    ensureSpace(h);
    if (rIdx % 2 === 1) doc.rect(MARGIN, y, CONTENT_WIDTH, h).fill(C.zebra);

    let cx = MARGIN;
    row.cells.forEach((cell, i) => {
      let cy = y + padY;
      const isBadge = opts.badgeColumn === i && (cell === 'PASS' || cell === 'FAIL');
      if (isBadge) {
        const badgeW = 34;
        const badgeH = 12;
        const badgeColor = cell === 'PASS' ? C.pass : C.fail;
        doc.save();
        doc.roundedRect(cx + padX, cy + 1, badgeW, badgeH, 3).fill(badgeColor);
        doc.fillColor('#ffffff').font(FONT_BOLD).fontSize(7);
        doc.text(cell, cx + padX, cy + 2.5, { width: badgeW, align: 'center', lineBreak: false });
        doc.restore();
      } else {
        const lines = wrapText(doc, cell, widths[i] - padX * 2);
        doc.font(FONT).fontSize(fontSize).fillColor(row.cellColors?.[i] ?? C.dark);
        for (const line of lines) {
          doc.text(line, cx + padX, cy, {
            width: widths[i] - padX * 2,
            lineBreak: false,
            ellipsis: true,
          });
          cy += lineHeight;
        }
      }
      cx += widths[i];
    });
    y += h;
  });

  // Garis tabel (grid)
  doc.strokeColor(C.border).lineWidth(0.5);
  let ly = startY;
  [headerHeight, ...rowHeights].forEach((h) => {
    doc.moveTo(MARGIN, ly + h).lineTo(MARGIN + CONTENT_WIDTH, ly + h).stroke();
    ly += h;
  });
  let vx = MARGIN;
  widths.forEach((w) => {
    doc.moveTo(vx, startY).lineTo(vx, ly).stroke();
    vx += w;
  });
  doc.moveTo(vx, startY).lineTo(vx, ly).stroke();

  return ly;
}

// ---------- Halaman cover ----------
function buildCover(doc: PDFKit.PDFDocument, report: AuditReport) {
  doc.font(FONT_BOLD).fontSize(10).fillColor(C.primary)
    .text('SEO CHECKER REPORT', MARGIN, 130, { align: 'center', width: CONTENT_WIDTH });

  const coverUrl = truncate(report.url, 72);
  doc.font(FONT_BOLD).fontSize(20).fillColor(C.dark)
    .text(coverUrl, MARGIN, 165, { align: 'center', width: CONTENT_WIDTH, lineBreak: false, ellipsis: true });

  doc.font(FONT_BOLD).fontSize(72).fillColor(scoreColor(report.score))
    .text(String(report.score), MARGIN, 230, { align: 'center', width: CONTENT_WIDTH });

  doc.font(FONT).fontSize(12).fillColor(C.muted)
    .text('SEO SCORE', MARGIN, 320, { align: 'center', width: CONTENT_WIDTH });

  const s = report.summary;
  doc.font(FONT).fontSize(11).fillColor(C.muted)
    .text(
      `Total: ${s.total}   Passed: ${s.passed}   Failed: ${s.failed}   Warnings: ${s.warnings}`,
      MARGIN, 370, { align: 'center', width: CONTENT_WIDTH }
    );

  doc.font(FONT).fontSize(10).fillColor(C.muted)
    .text(`Generated: ${formatDate(report.createdAt)}`, MARGIN, 410, {
      align: 'center',
      width: CONTENT_WIDTH,
    });
}

// ---------- Ringkasan skor per kategori ----------
function buildCategorySummary(doc: PDFKit.PDFDocument, report: AuditReport) {
  const rows = report.categories.map((cat) => {
    const passed = cat.checks.filter((c) => c.passed).length;
    const failed = cat.checks.filter((c) => !c.passed && c.severity !== 'minor').length;
    const warnings = cat.checks.filter((c) => !c.passed && c.severity === 'minor').length;
    return {
      cells: [
        CATEGORY_LABELS[cat.category] ?? cat.category,
        String(cat.score),
        String(passed),
        String(failed),
        String(warnings),
        String(cat.checks.length),
      ],
      cellColors: [undefined, scoreColor(cat.score)],
    };
  });

  doc.font(FONT_BOLD).fontSize(14).fillColor(C.dark)
    .text('Category Scores', MARGIN, MARGIN);

  return renderTable(doc, {
    headers: ['Category', 'Score', 'Passed', 'Failed', 'Warnings', 'Total'],
    widths: [180, 60, 72, 72, 64, 64], // total = 512 = CONTENT_WIDTH
    rows,
    y: MARGIN + 24,
    fontSize: 9,
  }) + 24; // y akhir setelah tabel summary
}

// ---------- Tabel per check per kategori ----------
function buildChecksTables(doc: PDFKit.PDFDocument, report: AuditReport, startY: number) {
  let y = startY;

  report.categories.forEach((cat, idx) => {
    if (cat.checks.length === 0) return;

    const rows: TableRow[] = cat.checks.map((check) => ({
      cells: [
        check.passed ? 'PASS' : 'FAIL',
        check.id,
        check.rule,
        check.severity ?? '-',
        check.message,
        check.recommendation ?? '-',
      ],
      cellColors: [
        check.passed ? C.pass : C.fail,
        undefined,
        undefined,
        check.severity === 'critical' ? C.fail : check.severity === 'major' ? C.warn : undefined,
        undefined,
        undefined,
      ],
    }));

    const heading = `${idx + 1}. ${CATEGORY_LABELS[cat.category] ?? cat.category}  ·  score ${cat.score}`;

    // Ukur tinggi tabel DULU biar heading & tabel selalu bareng (gak kepisah halaman).
    const headingH = 28;
    const tableH = measureTable(doc, {
      headers: ['Status', 'Rule ID', 'Rule', 'Sev', 'Message', 'Recommendation'],
      widths: [38, 56, 112, 28, 128, 150], // total = 512
      y: MARGIN,
      rows,
      fontSize: 8,
    });

    if (y + headingH + tableH > doc.page.height - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }

    // Baris section header dengan garis bawah tipis
    doc.font(FONT_BOLD).fontSize(12).fillColor(C.primary).text(heading, MARGIN, y);
    y += 18;
    doc.strokeColor(C.primary).lineWidth(0.8);
    doc.moveTo(MARGIN, y).lineTo(MARGIN + 120, y).stroke();
    y += 10;

    y = renderTable(doc, {
      headers: ['Status', 'Rule ID', 'Rule', 'Sev', 'Message', 'Recommendation'],
      widths: [38, 56, 112, 28, 128, 150], // total = 512
      rows,
      y: y,
      fontSize: 8,
      badgeColumn: 0,
    });

    y += 20;
  });
}

// ---------- Entry point ----------
export function generatePdf(report: AuditReport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: MARGIN,
      info: {
        Title: `SEO Report - ${report.url}`,
        Author: 'SEO Checker',
        Subject: report.url,
      },
    });

    // Footer tiap halaman (url kecil di bawah)
    doc.on('pageAdded', () => {
      doc.font(FONT).fontSize(7).fillColor(C.muted);
      // Truncate manual: URL panjang bikin pdfkit minta halaman baru di dalam
      // pageAdded -> loop tak berujung -> Maximum call stack size exceeded.
      doc.text(truncate(report.url, 90), MARGIN, doc.page.height - MARGIN - 12, {
        width: CONTENT_WIDTH,
        align: 'center',
        lineBreak: false,
      });
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Alur halaman: 1) cover -> 2) summary + checks (lanjut kontinu).
    buildCover(doc, report);
    doc.addPage();
    const afterSummary = buildCategorySummary(doc, report);
    buildChecksTables(doc, report, afterSummary);

    doc.end();
  });
}
