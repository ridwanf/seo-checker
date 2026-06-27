import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { CrawlerModule } from '../crawler/crawler.module';

@Module({
  imports: [CrawlerModule],
  controllers: [AuditController],
  providers: [AuditService],
})
// eslint-disable-next-line prettier/prettier
export class AuditModule { }
