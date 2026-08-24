import { Injectable } from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { ExportReportDto } from "./dto/export-report.dto";
import { AuditReport } from "@seo-checker/shared-types";
import { reportToCsv } from "./csv-generator";
import { generatePdf } from "./pdf-generator";
import { reportToJson } from "./json-generator";


export interface ExprotResult {
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
  constructor(
    private readonly auditService: AuditService
  ) { }

  async export(dto: ExportReportDto): Promise<ExprotResult> {
    // kalau client kirim report object, pakai saja langsung
    const report: AuditReport = dto.report
      ? (dto.report as unknown as AuditReport)
      : await this.auditService.create({ url: dto.url });

    const filename = `seo-report-${sanitizeFilename(dto.url)}.${dto.format}`;

    if (dto.format === 'csv') {
      return {
        buffer: Buffer.from(reportToCsv(report), 'utf-8'),
        contentType: 'text/csv; charset=utf-8',
        filename,
      }
    }
    if (dto.format === 'json') {
      return {
        buffer: Buffer.from(reportToJson(report), 'utf-8'),
        contentType: 'application/json; charset=utf-8',
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