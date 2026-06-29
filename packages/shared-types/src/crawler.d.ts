export interface CrawlResult {
    originalUrl: string;
    finalUrl: string;
    statusCode: number;
    responseTime: number;
    contentType: string;
    pageSize: number;
    html: string;
    headers: Record<string, string>;
    redirects: string[];
    robotsTxt?: string;
    sitemapXml?: string;
}
//# sourceMappingURL=crawler.d.ts.map