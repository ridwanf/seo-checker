import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service.js';

@Module({
  providers: [CrawlerService],
  exports: [CrawlerService],
})
// eslint-disable-next-line prettier/prettier
export class CrawlerModule { }
