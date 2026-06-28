import { Injectable } from '@nestjs/common';
import { CrawlerService } from '../crawler/crawler.service.js';
import { SeoService } from '../seo/seo.service.js';
import { CreateAuditDto } from './dto/create-audit.dto.js';
import { AuditReport } from '@seo-checker/shared-types';

@Injectable()
export class AuditService {
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly seoService: SeoService,
    // eslint-disable-next-line prettier/prettier
  ) { }

  async test(url: string): Promise<AuditReport> {
    const crawlsResult = await this.crawlerService.crawl(url);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.seoService.analyze(crawlsResult.url, crawlsResult.html);
  }

  async create(dto: CreateAuditDto): Promise<AuditReport> {
    const crawlResult = await this.crawlerService.crawl(dto.url);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.seoService.analyze(crawlResult.url, crawlResult.html);
  }
}
