import { Injectable } from '@nestjs/common';
import { CrawlerService, CrawlResult } from '../crawler/crawler.service';

@Injectable()
export class AuditService {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly crawlerService: CrawlerService) { }

  async test(url: string): Promise<CrawlResult> {
    return this.crawlerService.crawl(url);
  }
}
