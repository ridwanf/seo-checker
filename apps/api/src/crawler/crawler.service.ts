import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

export interface CrawlResult {
  url: string;
  html: string;
  statusCode: number;
  headers: Record<string, string>;
  responseTime: number;
}

@Injectable()
export class CrawlerService {
  async crawl(url: string): Promise<CrawlResult> {
    const startTime = Date.now();

    const response: AxiosResponse<string> = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'SEOCheckerBot/1.0',
      },
    });

    return {
      url,
      html: response.data,
      statusCode: response.status,
      headers: response.headers as Record<string, string>,
      responseTime: Date.now() - startTime,
    };
  }
}
