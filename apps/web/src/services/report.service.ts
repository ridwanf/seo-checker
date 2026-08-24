import type { AuditReport } from "@seo-checker/shared-types";
import axios from "axios";

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000
})

export type ExportFormat = 'pdf' | 'csv' | 'json'

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