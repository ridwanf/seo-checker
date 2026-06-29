import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller.js';
import { AuditService } from './audit.service.js';
import { CrawlerModule } from '../crawler/crawler.module.js';
import { SeoModule } from '../seo/seo.module.js';

@Module({
  imports: [CrawlerModule, SeoModule],
  controllers: [AuditController],
  providers: [AuditService],
})
// eslint-disable-next-line prettier/prettier
export class AuditModule { }
