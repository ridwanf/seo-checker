import { Module } from '@nestjs/common';
import { SeoService } from './seo.service';

@Module({
  providers: [SeoService],
  exports: [SeoService],
})
// eslint-disable-next-line prettier/prettier
export class SeoModule { }
