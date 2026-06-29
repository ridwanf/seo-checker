import { Injectable } from '@nestjs/common';
import { SeoEngine } from '@seo-checker/seo-engine';
import { AuditReport } from '@seo-checker/shared-types';
import { CrawlResult } from '@seo-checker/shared-types';

@Injectable()
export class SeoService {
  private readonly engine = new SeoEngine();

  async analyze(crawl: CrawlResult): Promise<AuditReport> {
    return this.engine.analyze(crawl);
  }
}
