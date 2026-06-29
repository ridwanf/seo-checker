import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { performance } from 'perf_hooks';
import { CrawlResult } from '@seo-checker/shared-types';
import { AxiosError } from 'axios';

@Injectable()
export class CrawlerService {
  async crawl(url: string): Promise<CrawlResult> {
    const started = performance.now();

    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'SEO-Checker-Bot/1.0' },
        timeout: 10000,
        maxRedirects: 10,
      });

      const total = Math.round(performance.now() - started);
      const headers = response.headers as Record<string, string>;

      // Extract useful headers
      const encoding = headers['content-encoding'] ?? undefined;
      const server = headers['server'] ?? undefined;
      const protocol = (response.request?.res?.httpVersion)
        ? `HTTP/${response.request.res.httpVersion}`
        : undefined;

      // Build redirect chain from axios
      const redirectChain: string[] = [];
      if (response.request?.redirects?.length > 0) {
        response.request.redirects.forEach((r: any) => {
          redirectChain.push(r.url);
        });
      }

      // Fetch robots.txt
      const robots = await this.fetchRobots(url, headers);

      // Fetch sitemap.xml
      const sitemap = await this.fetchSitemap(url, robots);

      return {
        originalUrl: url,
        finalUrl: response.request?.res?.responseUrl ?? url,
        statusCode: response.status,
        responseTime: { total },
        contentType: headers['content-type'] ?? '',
        pageSize: Buffer.byteLength(response.data),
        encoding,
        protocol,
        server,
        html: response.data,
        headers,
        redirectChain,
        robots,
        sitemap,
      };
    } catch (error: AxiosError | any) {
      const total = Math.round(performance.now() - started);

      return {
        originalUrl: url,
        finalUrl: url,
        statusCode: error.response?.status ?? 500,
        responseTime: { total },
        contentType: '',
        pageSize: 0,
        html: '',
        headers: {},
        redirectChain: [],
        robots: { found: false },
        sitemap: { found: false },
      };
    }
  }

  private async fetchRobots(
    url: string,
    headers: Record<string, string>
  ): Promise<{ found: boolean; url?: string; content?: string; sitemaps?: string[]; crawlDelay?: number }> {
    try {
      const { origin } = new URL(url);
      const robotsUrl = `${origin}/robots.txt`;
      const response = await axios.get(robotsUrl, { timeout: 5000 });
      const content: string = response.data;

      // Extract sitemaps from robots.txt
      const sitemaps = content
        .split('\n')
        .filter((line) => line.toLowerCase().startsWith('sitemap:'))
        .map((line) => line.split(':').slice(1).join(':').trim());

      // Extract crawl delay
      const crawlDelayLine = content
        .split('\n')
        .find((line) => line.toLowerCase().startsWith('crawl-delay:'));
      const crawlDelay = crawlDelayLine
        ? parseInt(crawlDelayLine.split(':')[1].trim(), 10)
        : undefined;

      return {
        found: true,
        url: robotsUrl,
        content,
        sitemaps,
        crawlDelay,
      };
    } catch {
      return { found: false };
    }
  }

  private async fetchSitemap(
    url: string,
    robots: { found: boolean; sitemaps?: string[] }
  ): Promise<{ found: boolean; url?: string; urlCount?: number; content?: string }> {
    try {
      // Try sitemap from robots.txt first, then default
      const { origin } = new URL(url);
      const sitemapUrl =
        robots.sitemaps?.[0] ?? `${origin}/sitemap.xml`;

      const response = await axios.get(sitemapUrl, { timeout: 5000 });
      const content: string = response.data;

      // Count URLs in sitemap
      const urlCount = (content.match(/<url>/g) ?? []).length;

      return {
        found: true,
        url: sitemapUrl,
        urlCount,
        content,
      };
    } catch {
      return { found: false };
    }
  }
}