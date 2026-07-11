import axios, { AxiosError } from 'axios';
import type { AuditReport } from '@seo-checker/shared-types';

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  resetAt?: string;
  limit?: number;
}

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export class AuditService {
  async analyze(url: string): Promise<AuditReport> {
    try {
      const { data } = await client.post<AuditReport>('/audit', { url });
      return data;
    } catch (err) {
      const error = err as AxiosError<ApiError>;

      if (error.response) {
        const { statusCode, message } = error.response.data;

        if (statusCode === 429) {
          const resetAt = error.response.data.resetAt;
          const resetTime = resetAt
            ? new Date(resetAt).toLocaleTimeString()
            : 'midnight';

          throw new Error(
            `Daily limit reached. You can run another audit after ${resetTime}.`
          );
        }

        // Validation error
        if (statusCode === 400) {
          throw new Error(message ?? 'Invalid URL provided.');
        }

        // Server error
        if (statusCode >= 500) {
          throw new Error('Server error. Please try again later.');
        }

        throw new Error(message ?? 'An unexpected error occurred.');
      }

      // Network error (no response)
      if (error.request) {
        throw new Error('Cannot connect to server. Please check your connection.');
      }

      throw new Error('An unexpected error occurred.');
    }
  }

}

export const auditService = new AuditService();