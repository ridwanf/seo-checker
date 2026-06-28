import { Injectable } from '@nestjs/common';
import { SeoEngine } from '@seo-checker/seo-engine';

@Injectable()
export class SeoService {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  private readonly engine = new SeoEngine();

  analyze(url: string, html: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return this.engine.analyze(url, html);
  }
}
