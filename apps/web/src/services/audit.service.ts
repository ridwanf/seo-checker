import axios from 'axios';
import type { AuditReport } from '@seo-checker/shared-types';

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export class AuditService {
  async analyze(url: string): Promise<AuditReport> {
    const { data } = await client.post<AuditReport>('/audit', { url });
    return data;
  }
}

export const auditService = new AuditService();