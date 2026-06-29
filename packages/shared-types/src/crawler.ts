export interface ResponseTiming {
  total: number;
  ttfb?: number;
  dns?: number;
  tls?: number;
  download?: number;
}

export interface RobotsInfo {
  found: boolean;
  url?: string;
  crawlDelay?: number;
  sitemaps?: string[];
  content?: string;
}

export interface SitemapInfo {
  found: boolean;
  url?: string;
  urlCount?: number;
  content?: string;
}

export interface CrawlResult {
  originalUrl: string;
  finalUrl: string;

  statusCode: number;
  responseTime: ResponseTiming;

  contentType: string;
  pageSize: number;
  encoding?: string; // e.g. gzip, br
  protocol?: string; // e.g. HTTP/2, HTTP/3
  server?: string; // e.g. CloudFront, nginx

  html: string;
  headers: Record<string, string>;
  redirectChain: string[]; // Full redirect chain

  robots: RobotsInfo;
  sitemap: SitemapInfo;
}