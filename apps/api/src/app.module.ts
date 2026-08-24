import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuditModule } from './audit/audit.module.js';
import { CrawlerModule } from './crawler/crawler.module.js';
import { SeoModule } from './seo/seo.module.js';
import { HealthModule } from './health/health.module.js';
import { RedisModule } from './redis/redis.module.js';
import { ReportsModule } from './reports/reports.module.js';

@Module({
  imports: [RedisModule, AuditModule, CrawlerModule, SeoModule, HealthModule, ReportsModule],
  controllers: [AppController],
  providers: [AppService],
})
// eslint-disable-next-line prettier/prettier
export class AppModule { }
