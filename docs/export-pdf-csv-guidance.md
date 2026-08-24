Semua konteks repo sudah saya cek (audit module pattern, shared-types, web services, vite proxy, docker build, tsconfig). Ini deliverable lengkapnya.

---

# 📦 EXPORT PDF + CSV — Contoh Kode Lengkap (SHARING di-skip total)

## 0. Temuan penting dari repo (baca dulu, biar kode konsisten)

1. **API pakai Node16 module resolution** → semua relative import WAJIB pakai ekstensi `.js` (contoh: `./reports.service.js`), walau file-nya `.ts`. Ini pattern di semua file existing (`audit.controller.ts`, `app.module.ts`).
2. **`AuditModule` belum `exports` service-nya** → `ReportsService` perlu inject `AuditService`, jadi `audit.module.ts` harus ditambah `exports: [AuditService]` (satu baris, ada di bagian 3).
3. **Port API sebenarnya 3000** (`main.ts`: `process.env.PORT || 3000`), web dev di 3001 dengan proxy `/api` → `http://localhost:3000` (strip prefix `/api`). Jadi dari web cukup panggil `/api/reports/export`, **gak perlu ubah vite config**.
4. **`ValidationPipe` global: `whitelist + forbidNonWhitelisted`** → DTO export harus deklarasi semua key yang diizinkan (`url`, `format`, `report`), kalau tidak bakal 400.
5. **Docker `pnpm install --frozen-lockfile`** → setelah `pnpm add`, lockfile (`pnpm-lock.yaml`) WAJIB ke-commit. `pdfkit` harus jadi `dependencies` (bukan dev) karena runner cuma install `--prod`.
6. **Style API**: pakai semicolon + komentar `// eslint-disable-next-line prettier/prettier` sebelum constructor. **Style web**: no semicolon, single quotes.
7. `AuditReport` dari client punya `createdAt` berupa **string** (hasil JSON) — PDF generator harus handle `string | Date`.

---

## 1. Install dependency

```bash
cd /home/openclawops/.openclaw/workspace/seo-checker

# pdfkit = runtime dependency (penting buat docker --prod)
pnpm --filter @seo-checker/api add pdfkit

# types = devDependency (cuma buat build)
pnpm --filter @seo-checker/api add -D @types/pdfkit
```

CSV manual tanpa library. `pnpm add` otomatis update `pnpm-lock.yaml` — commit lockfile-nya.

---

## 2. API — File baru

### 📄 `apps/api/src/reports/csv-generator.ts`

```ts
import type { AuditReport } from '@seo-checker/shared-types';

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
        (check.fixExamples ?? []).map((fix) => fix.title).join('; '),
      ]);
    }
  }

  const lines = [CSV_HEADER, ...rows].map((row) =>
    row.map(escapeCsv).join(',')
  );

  return `\uFEFF${lines.join('\r\n')}\r\n`;
}
```

---

### 📄 `apps/api/src/reports/pdf-generator.ts`

Pakai pdfkit murni (tanpa puppeteer). Tabel dibuat manual dengan helper `renderTable` (grid + wrap text + auto page-break). Font bawaan Helvetica (gak perlu setup font file).

```ts
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
}

/** Gambar tabel + grid + zebra, auto pindah halaman. Return y terakhir. */
function renderTable(doc: PDFKit.PDFDocument, opts: TableOptions): number {
  const { headers, widths, rows, y: startY, fontSize = 8 } = opts;
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
      const lines = wrapText(doc, cell, widths[i] - padX * 2);
      let cy = y + padY;
      doc.font(FONT).fontSize(fontSize).fillColor(row.cellColors?.[i] ?? C.dark);
      for (const line of lines) {
        doc.text(line, cx + padX, cy, {
          width: widths[i] - padX * 2,
          lineBreak: false,
          ellipsis: true,
        });
        cy += lineHeight;
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

  doc.font(FONT_BOLD).fontSize(26).fillColor(C.dark)
    .text(report.url, MARGIN, 160, { align: 'center', width: CONTENT_WIDTH });

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

  const y = renderTable(doc, {
    headers: ['Category', 'Score', 'Passed', 'Failed', 'Warnings', 'Total'],
    widths: [180, 60, 72, 72, 64, 64], // total = 512 = CONTENT_WIDTH
    rows,
    y: MARGIN + 24,
    fontSize: 9,
  });

  void y; // sengaja tidak dipakai; kategori berikutnya mulai halaman baru sendiri
}

// ---------- Tabel per check per kategori ----------
function buildChecksTables(doc: PDFKit.PDFDocument, report: AuditReport) {
  let y = MARGIN;

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

    const heading = `${idx + 1}. ${CATEGORY_LABELS[cat.category] ?? cat.category} (score: ${cat.score})`;

    if (y + 40 > doc.page.height - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }

    doc.font(FONT_BOLD).fontSize(13).fillColor(C.dark).text(heading, MARGIN, y);
    y += 22;

    y = renderTable(doc, {
      headers: ['Status', 'Rule ID', 'Rule', 'Sev', 'Message', 'Recommendation'],
      widths: [50, 70, 76, 44, 130, 142], // total = 512
      rows,
      y,
      fontSize: 8,
    });

    y += 24;
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
      doc.text(report.url, MARGIN, doc.page.height - 20, {
        width: CONTENT_WIDTH,
        align: 'center',
        lineBreak: false,
        ellipsis: true,
      });
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    buildCover(doc, report);
    buildCategorySummary(doc, report);
    buildChecksTables(doc, report);

    doc.end();
  });
}
```

> Catatan: kalau nanti mau font custom, tinggal `doc.registerFont('Nama', '/path/font.ttf')` lalu ganti `FONT`/`FONT_BOLD`. Untuk sekarang font bawaan sudah cukup.

---

### 📄 `apps/api/src/reports/dto/export-report.dto.ts`

```ts
import { IsIn, IsNotEmpty, IsObject, IsOptional, IsUrl } from 'class-validator';

export class ExportReportDto {
  @IsUrl({}, { message: 'Invalid URL format' })
  @IsNotEmpty({ message: 'URL is required' })
  url!: string;

  @IsIn(['pdf', 'csv'], { message: 'Format must be "pdf" or "csv"' })
  format!: 'pdf' | 'csv';

  /**
   * Opsional: kalau client kirim hasil audit yang sudah ada,
   * dipakai langsung tanpa re-crawl. Tanpa @Type/@ValidateNested,
   * isi object dibiarkan apa adanya (cocok untuk whitelist pipe).
   */
  @IsOptional()
  @IsObject({ message: 'report must be an object' })
  report?: Record<string, unknown>;
}
```

---

### 📄 `apps/api/src/reports/reports.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import type { AuditReport } from '@seo-checker/shared-types';
import { AuditService } from '../audit/audit.service.js';
import { ExportReportDto } from './dto/export-report.dto.js';
import { reportToCsv } from './csv-generator.js';
import { generatePdf } from './pdf-generator.js';

export interface ExportResult {
  buffer: Buffer;
  contentType: string;
  filename: string;
}

function sanitizeFilename(url: string): string {
  const slug = url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || 'report';
}

@Injectable()
export class ReportsService {
  // eslint-disable-next-line prettier/prettier
  constructor(
    private readonly auditService: AuditService
  ) { }

  async export(dto: ExportReportDto): Promise<ExportResult> {
    // Kalau client kirim report object, pakai langsung (gak re-crawl)
    const report: AuditReport = dto.report
      ? (dto.report as unknown as AuditReport)
      : await this.auditService.create({ url: dto.url });

    const filename = `seo-report-${sanitizeFilename(dto.url)}.${dto.format}`;

    if (dto.format === 'csv') {
      return {
        buffer: Buffer.from(reportToCsv(report), 'utf-8'),
        contentType: 'text/csv; charset=utf-8',
        filename,
      };
    }

    return {
      buffer: await generatePdf(report),
      contentType: 'application/pdf',
      filename,
    };
  }
}
```

---

### 📄 `apps/api/src/reports/reports.controller.ts`

```ts
import { Body, Controller, Post, StreamableFile } from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { ExportReportDto } from './dto/export-report.dto.js';

@Controller('reports')
export class ReportsController {
  // eslint-disable-next-line prettier/prettier
  constructor(
    private readonly reportsService: ReportsService
  ) { }

  @Post('export')
  async export(@Body() dto: ExportReportDto): Promise<StreamableFile> {
    const { buffer, contentType, filename } = await this.reportsService.export(dto);
    return new StreamableFile(buffer, {
      type: contentType,
      disposition: `attachment; filename="${filename}"`,
      length: buffer.length,
    });
  }
}
```

> `StreamableFile` + opsi `disposition` otomatis set `Content-Disposition: attachment` → browser download, bukan render inline.

---

### 📄 `apps/api/src/reports/reports.module.ts`

```ts
import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [AuditModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
// eslint-disable-next-line prettier/prettier
export class ReportsModule { }
```

---

## 3. Edit file API yang existing

### 📄 `apps/api/src/audit/audit.module.ts` — tambah 1 baris

```ts
@Module({
  imports: [CrawlerModule, SeoModule],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService], // ← TAMBAHKAN ini (biar ReportsModule bisa inject AuditService)
})
```

### 📄 `apps/api/src/app.module.ts` — register ReportsModule

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuditModule } from './audit/audit.module.js';
import { CrawlerModule } from './crawler/crawler.module.js';
import { SeoModule } from './seo/seo.module.js';
import { HealthModule } from './health/health.module.js';
import { ReportsModule } from './reports/reports.module.js'; // ← tambah

@Module({
  imports: [AuditModule, CrawlerModule, SeoModule, HealthModule, ReportsModule], // ← tambah ReportsModule
  controllers: [AppController],
  providers: [AppService],
})
// eslint-disable-next-line prettier/prettier
export class AppModule { }
```

---

## 4. Web — File baru + edit

### 📄 `apps/web/src/services/report.service.ts`

Ikuti pattern `audit.service.ts` (axios instance baseURL `/api`).

```ts
import axios from 'axios'
import type { AuditReport } from '@seo-checker/shared-types'

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
})

export type ExportFormat = 'pdf' | 'csv'

export class ReportService {
  async exportReport(
    url: string,
    format: ExportFormat,
    report?: AuditReport
  ): Promise<Blob> {
    const { data } = await client.post<Blob>(
      '/reports/export',
      { url, format, report },
      { responseType: 'blob' }
    )
    return data
  }
}

export const reportService = new ReportService()
```

> Catatan: kalau `report` undefined, axios otomatis drop key-nya dari JSON → server re-crawl. Kalau ada, server pakai langsung. Persis dengan requirement "kalau report object dikirim dari client langsung pakai itu".

### 📄 `apps/web/src/utils/download.ts` — helper blob download

```ts
export function downloadBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
}

export function sanitizeFilename(url: string, format: string): string {
  const slug =
    url
      .replace(/^https?:\/\//, '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'report'
  return `seo-report-${slug}.${format}`
}
```

### 📄 `apps/web/src/components/report/ExportActions.tsx` — tombol Download PDF + CSV

```tsx
import { useState } from 'react'
import type { AuditReport } from '@seo-checker/shared-types'
import { reportService, type ExportFormat } from '@/services/report.service'
import { downloadBlob, sanitizeFilename } from '@/utils/download'

interface ExportActionsProps {
  url: string
  report?: AuditReport | null
}

export function ExportActions({ url, report }: ExportActionsProps) {
  const [busy, setBusy] = useState<ExportFormat | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleExport(format: ExportFormat) {
    if (busy) return
    setBusy(format)
    setError(null)
    try {
      const blob = await reportService.exportReport(url, format, report ?? undefined)
      downloadBlob(blob, sanitizeFilename(url, format))
    } catch (err) {
      console.error('Export failed:', err)
      setError('Export gagal, coba lagi.')
    } finally {
      setBusy(null)
    }
  }

  const btnClass =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-destructive">{error}</span>}
      <button
        type="button"
        className={btnClass}
        disabled={busy !== null}
        onClick={() => handleExport('pdf')}
      >
        {busy === 'pdf' ? 'Membuat PDF…' : '⬇ PDF'}
      </button>
      <button
        type="button"
        className={btnClass}
        disabled={busy !== null}
        onClick={() => handleExport('csv')}
      >
        {busy === 'csv' ? 'Membuat CSV…' : '⬇ CSV'}
      </button>
    </div>
  )
}
```

### 📄 `apps/web/src/App.tsx` — taruh ExportActions di header report

Tambah import di atas (bareng import lain):

```tsx
import { ExportActions } from '@/components/report/ExportActions'
```

Lalu ganti blok "Analyzed URL" yang sekarang:

```tsx
{/* Analyzed URL */}
<div className="flex items-center justify-between py-2 border-b border-border">
  <div className="flex items-center gap-2">
    <span className="text-xs text-muted-foreground">Analyzed</span>
    <a
      href={report.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-primary hover:underline transition-colors"
    >
      {report.url}
    </a>
  </div>
  <div className="flex items-center gap-4">
    <span className="text-xs text-muted-foreground hidden sm:inline">
      {new Date(report.createdAt).toLocaleString()}
    </span>
    <ExportActions url={report.url} report={report} />
  </div>
</div>
```

---

## 5. Langkah implementasi (urutan aman)

1. **Install deps** (bagian 1) → pastikan `pnpm-lock.yaml` berubah & di-commit.
2. **Buat 5 file API baru** (bagian 2): `csv-generator.ts`, `pdf-generator.ts`, `dto/export-report.dto.ts`, `reports.service.ts`, `reports.controller.ts`, `reports.module.ts`.
3. **Edit 2 file existing**: `audit.module.ts` (tambah `exports`), `app.module.ts` (register `ReportsModule`).
4. **Build & cek compile**:
   ```bash
   cd /home/openclawops/.openclaw/workspace/seo-checker
   pnpm --filter @seo-checker/api build
   ```
   (NestJS `--watch` di `pnpm dev` juga akan restart otomatis begitu file disimpan.)
5. **Test endpoint via curl** (bagian 6).
6. **Buat 3 file web** (bagian 4): `services/report.service.ts`, `utils/download.ts`, `components/report/ExportActions.tsx`.
7. **Edit `App.tsx`** (header report + import).
8. **Test dari web** (bagian 6). Commit + push tag `v*` untuk deploy (pakai flow CI yang sudah ada).

---

## 6. Cara test

### Test API (curl)

```bash
cd /home/openclawops/.openclaw/workspace/seo-checker
pnpm dev
# API jalan di :3000, web di :3001 (proxy /api -> :3000)
```

**CSV:**
```bash
curl -sS -X POST http://localhost:3000/reports/export \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com","format":"csv"}' \
  -o /tmp/seo.csv

file /tmp/seo.csv          # harus: CSV text
head -5 /tmp/seo.csv       # header + baris check pertama
```

**PDF:**
```bash
curl -sS -X POST http://localhost:3000/reports/export \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com","format":"pdf"}' \
  -o /tmp/seo.pdf

file /tmp/seo.pdf          # harus: PDF document
ls -la /tmp/seo.pdf
```

**Cek header response (Content-Disposition harus attachment):**
```bash
curl -sS -D - -o /dev/null -X POST http://localhost:3000/reports/export \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com","format":"pdf"}'
# expect: HTTP/1.1 200 OK
#         Content-Type: application/pdf
#         Content-Disposition: attachment; filename="seo-report-example-com.pdf"
```

**Test pakai report existing (tanpa re-crawl):**
```bash
# 1. ambil report dari endpoint audit
curl -sS -X POST http://localhost:3000/audit \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com"}' -o /tmp/report.json

# 2. bungkus jadi payload export
node -e "const r=require('/tmp/report.json');console.log(JSON.stringify({url:'https://example.com',format:'csv',report:r}))" \
  > /tmp/payload.json

# 3. kirim (server harusnya langsung pakai report, gak crawl ulang)
curl -sS -X POST http://localhost:3000/reports/export \
  -H 'Content-Type: application/json' \
  --data-binary @/tmp/payload.json -o /tmp/seo2.csv && head -3 /tmp/seo2.csv
```

**Test validasi (harus 400):**
```bash
# format salah
curl -sS -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3000/reports/export \
  -H 'Content-Type: application/json' -d '{"url":"https://example.com","format":"docx"}'
# url hilang
curl -sS -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3000/reports/export \
  -H 'Content-Type: application/json' -d '{"format":"csv"}'
# keduanya harus 400 (efek forbidNonWhitelisted + validators)
```

### Test dari web

1. Buka `http://localhost:3001`, audit satu URL.
2. Di baris header report (sebelah tanggal "Analyzed"), muncul tombol **⬇ PDF** dan **⬇ CSV**.
3. Klik PDF → file `seo-report-<url>.pdf` ke-download, isi: cover (URL + skor besar + tanggal) → tabel ringkasan per kategori → tabel per check per kategori.
4. Klik CSV → `seo-report-<url>.csv`, buka di Excel/Google Sheets: 1 baris per check, kolom `category, rule_id, passed, severity, message, recommendation, why, fix_titles`, teks berkoma/quote/newline sudah di-escape.

---

## Ringkasan file yang dibuat/diubah

| Aksi | Path |
|---|---|
| Baru | `apps/api/src/reports/csv-generator.ts` |
| Baru | `apps/api/src/reports/pdf-generator.ts` |
| Baru | `apps/api/src/reports/dto/export-report.dto.ts` |
| Baru | `apps/api/src/reports/reports.service.ts` |
| Baru | `apps/api/src/reports/reports.controller.ts` |
| Baru | `apps/api/src/reports/reports.module.ts` |
| Edit | `apps/api/src/audit/audit.module.ts` (tambah `exports: [AuditService]`) |
| Edit | `apps/api/src/app.module.ts` (register `ReportsModule`) |
| Baru | `apps/web/src/services/report.service.ts` |
| Baru | `apps/web/src/utils/download.ts` |
| Baru | `apps/web/src/components/report/ExportActions.tsx` |
| Edit | `apps/web/src/App.tsx` (import + tombol di header report) |
| Deps | `apps/api/package.json` → `pdfkit` (dependencies), `@types/pdfkit` (devDependencies) + lockfile |

**Gotcha yang paling sering bikin error:** lupa `exports: [AuditService]` di AuditModule (Nest bakal error "Nest can't resolve dependencies of the ReportsService") dan lupa commit `pnpm-lock.yaml` (CI docker pakai `--frozen-lockfile`). Semua kode di atas sudah disesuaikan dengan pattern existing repo (import `.js`, style prettier, axios baseURL `/api`, tailwind zinc palette).