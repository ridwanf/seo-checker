import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './audit/audit.module';
import { CrawlerModule } from './crawler/crawler.module';

@Module({
  imports: [AuditModule, CrawlerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
