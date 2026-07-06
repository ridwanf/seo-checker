import {
  AuditCheck,
  FixExample,
  SeoRuleContext,
} from '@seo-checker/shared-types';

/**
 * RecommendationEngine generates fix examples for failed SEO checks.
 * Each rule ID has its own set of template-based fix examples
 * that can be enriched with dynamic values from the rule context.
 */
export class RecommendationEngine {
  private generators: Map<string, FixExampleGenerator>;

  constructor() {
    this.generators = new Map();
    this.registerAll();
  }

  /**
   * Generate fix examples for a given check and context.
   */
  generate(check: AuditCheck, context: SeoRuleContext): FixExample[] | undefined {
    if (check.passed) return undefined;

    const generator = this.generators.get(check.id);
    if (!generator) return undefined;

    return generator(check, context);
  }

  private registerAll(): void {
    // ── Meta Tags ──
    this.register('META001', (_check: AuditCheck, ctx: SeoRuleContext) => {
      const docTitle = ctx.$('title').text().trim();
      return [
        {
          title: 'Add a <title> Tag',
          before: '<head>\n  <meta charset="UTF-8">\n</head>',
          after: `<head>\n  <meta charset="UTF-8">\n  <title>A descriptive title for this page</title>\n</head>`,
          explanation:
            'Every page must have exactly one <title> tag inside the <head>. Make it unique and include your primary keyword.',
        },
        {
          title: 'WordPress / CMS Users',
          before: '// In Yoast SEO or Rank Math, leave the SEO title field empty',
          after: '// Set a custom SEO title like:\n// "Primary Keyword - Secondary Keyword | Site Name"',
          explanation:
            'Most CMS platforms have a built-in SEO section where you can set the meta title per page.',
        },
      ];
    });

    this.register('META002', (_check: AuditCheck, ctx: SeoRuleContext) => {
      const title = ctx.$('title').text().trim();
      const len = title.length;
      const suggestion =
        len < 30
          ? 'Add more context, e.g., include your primary keyword + a benefit.'
          : 'Shorten the title by removing stop words or redundant branding.';

      return [
        {
          title: len < 30 ? 'Lengthen the Title' : 'Shorten the Title',
          before: `<title>${title}</title>`,
          after:
            len < 30
              ? `<title>${title} — Your Keyword & Benefit Here</title>`
              : `<title>${title.slice(0, 55)}…</title>`,
          explanation: suggestion,
        },
      ];
    });

    this.register('META003', (_check: AuditCheck, ctx: SeoRuleContext) => {
      return [
        {
          title: 'Add a Meta Description',
          before: '<head>\n  <title>Page Title</title>\n</head>',
          after: '<head>\n  <title>Page Title</title>\n  <meta name="description" content="A compelling 150–160 character summary of this page.">\n</head>',
          explanation:
            'The meta description appears in search results below the title. Write a unique, persuasive summary for each page.',
        },
      ];
    });

    this.register('META004', (_check: AuditCheck, ctx: SeoRuleContext) => {
      const desc = ctx.$('meta[name="description"]').attr('content') ?? '';
      const len = desc.length;
      return [
        {
          title: len < 120 ? 'Increase Meta Description Length' : 'Shorten Meta Description',
          before: `<meta name="description" content="${desc}">`,
          after:
            len < 120
              ? `<meta name="description" content="${desc} Add more details to reach 120–160 characters, including a CTA.">`
              : `<meta name="description" content="${desc.slice(0, 155)}">`,
          explanation:
            'Optimal meta description length is 120–160 characters. Too short misses ranking signals; too long gets truncated.',
        },
      ];
    });

    this.register('META005', (_check: AuditCheck, ctx: SeoRuleContext) => {
      return [
        {
          title: 'Add Viewport Meta Tag',
          before: '<head>\n  <title>Page Title</title>\n</head>',
          after: '<head>\n  <title>Page Title</title>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n</head>',
          explanation:
            'The viewport meta tag is required for mobile-responsive pages. Without it, mobile browsers render the page at a desktop width.',
        },
      ];
    });

    // ── Content ──
    this.register('CON001', (_check: AuditCheck, ctx: SeoRuleContext) => {
      return [
        {
          title: 'Add an H1 Heading',
          before: '<body>\n  <main>\n    <p>Welcome to our site</p>\n  </main>\n</body>',
          after: '<body>\n  <main>\n    <h1>Your Primary Keyword-Rich Headline</h1>\n    <p>Welcome to our site</p>\n  </main>\n</body>',
          explanation:
            'Each page should have exactly one <h1> that clearly describes the page topic. It signals relevance to search engines.',
        },
      ];
    });

    this.register('CON002', (_check: AuditCheck, ctx: SeoRuleContext) => {
      const imgs = ctx.$('img');
      const examples: FixExample[] = [];
      let count = 0;
      imgs.each((_: number, el: any) => {
        if (count >= 2) return false;
        const src = ctx.$(el).attr('src') ?? '';
        if (!ctx.$(el).attr('alt') || ctx.$(el).attr('alt')?.trim() === '') {
          const filename = src.split('/').pop() ?? 'image.jpg';
          const suggestedAlt =
            filename.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, '');
          examples.push({
            title: `Fix alt text for ${filename}`,
            before: `<img src="${src}">`,
            after: `<img src="${src}" alt="${suggestedAlt}">`,
            explanation:
              'Alt text helps search engines understand images and improves accessibility for screen reader users.',
          });
          count++;
        }
      });
      return examples.length > 0
        ? examples
        : [
            {
              title: 'Add Alt Text to Images',
              before: '<img src="photo.jpg">',
              after: '<img src="photo.jpg" alt="Descriptive text about this photo">',
              explanation:
                'Add descriptive alt attributes to all <img> tags. Keep them concise and relevant to the image content.',
            },
          ];
    });

    this.register('CON003', (_check: AuditCheck, ctx: SeoRuleContext) => {
      return [
        {
          title: 'Fix Heading Hierarchy',
          before: '<h1>Topic</h1>\n<h3>Sub-topic</h3>',
          after: '<h1>Topic</h1>\n<h2>Sub-topic</h2>\n<h3>Sub-sub-topic</h3>',
          explanation:
            'Headings should follow a logical hierarchy: H1 → H2 → H3. Don\'t skip levels. This improves readability and SEO.',
        },
        {
          title: 'Use Headings to Structure Content',
          before: '<p>Section content here</p>',
          after: '<h2>Section Title</h2>\n<p>Section content here</p>',
          explanation:
            'Break long content into sections with descriptive headings. This helps both users and search engines navigate your content.',
        },
      ];
    });

    // ── Technical ──
    this.register('TECH001', (_check: AuditCheck, ctx: SeoRuleContext) => {
      return [
        {
          title: 'Add a Canonical URL',
          before: '<head>\n  <title>Page Title</title>\n</head>',
          after: '<head>\n  <title>Page Title</title>\n  <link rel="canonical" href="https://example.com/preferred-url">\n</head>',
          explanation:
            'The canonical tag tells search engines which URL is the master copy. This prevents duplicate content issues.',
        },
      ];
    });

    this.register('TECH002', (_check: AuditCheck, ctx: SeoRuleContext) => {
      return [
        {
          title: 'Add Lang Attribute to <html>',
          before: '<html>',
          after: '<html lang="en">',
          explanation:
            'The lang attribute tells search engines and browsers the language of the page. It\'s essential for international SEO.',
        },
      ];
    });

    this.register('TECH003', (_check: AuditCheck, ctx: SeoRuleContext) => {
      return [
        {
          title: 'Add a Favicon',
          before: '<head>\n  <title>Page Title</title>\n</head>',
          after: '<head>\n  <title>Page Title</title>\n  <link rel="icon" type="image/x-icon" href="/favicon.ico">\n</head>',
          explanation:
            'A favicon appears in browser tabs and bookmarks. While not a direct ranking factor, it improves user trust and brand recognition.',
        },
      ];
    });

    this.register('TECH004', (_check: AuditCheck, ctx: SeoRuleContext) => {
      return [
        {
          title: 'Use HTTPS',
          before: 'http://example.com',
          after: 'https://example.com',
          explanation:
            'HTTPS is a confirmed ranking signal. It encrypts data between the browser and server, protecting user privacy.',
        },
        {
          title: 'Set Up a Redirect',
          before: '// Old HTTP URL → returns 200 OK directly',
          after: '// Add a 301 redirect in your server config:\n// Apache: Redirect 301 / https://example.com/\n// Nginx:  return 301 https://$host$request_uri;',
          explanation:
            'Set up a 301 permanent redirect from HTTP to HTTPS to preserve link equity and avoid duplicate content.',
        },
      ];
    });

    this.register('TECH005', (_check: AuditCheck, ctx: SeoRuleContext) => {
      return [
        {
          title: 'Add robots Meta Tag',
          before: '<head>\n  <title>Page Title</title>\n</head>',
          after: '<head>\n  <title>Page Title</title>\n  <meta name="robots" content="index, follow">\n</head>',
          explanation:
            'The robots meta tag controls whether search engines index the page and follow its links. Use "index, follow" for pages you want in search results.',
        },
      ];
    });

    // ── Social ──
    this.register('SOCIAL001', (_check: AuditCheck, ctx: SeoRuleContext) => {
      return [
        {
          title: 'Add Open Graph Tags',
          before: '<head>\n  <title>Page Title</title>\n</head>',
          after: `<head>
  <title>Page Title</title>
  <meta property="og:title" content="Page Title">
  <meta property="og:description" content="A brief description">
  <meta property="og:image" content="https://example.com/thumbnail.jpg">
  <meta property="og:url" content="https://example.com/page">
  <meta property="og:type" content="website">
</head>`,
          explanation:
            'Open Graph tags control how your page appears when shared on Facebook, LinkedIn, and other platforms.',
        },
      ];
    });

    this.register('SOCIAL002', (_check: AuditCheck, ctx: SeoRuleContext) => {
      return [
        {
          title: 'Add Twitter Card Tags',
          before: '<head>\n  <title>Page Title</title>\n</head>',
          after: `<head>
  <title>Page Title</title>
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Page Title">
  <meta name="twitter:description" content="A brief description">
  <meta name="twitter:image" content="https://example.com/thumbnail.jpg">
</head>`,
          explanation:
            'Twitter Card tags control how your page appears in tweets. Cards with images get significantly more engagement.',
        },
      ];
    });

    // ── Accessibility ──
    this.register('A11Y001', (_check: AuditCheck, ctx: SeoRuleContext) => {
      return [
        {
          title: 'Add ARIA Labels to Interactive Elements',
          before: '<button>\n  <svg><!-- icon --></svg>\n</button>',
          after: '<button aria-label="Search">\n  <svg><!-- icon --></svg>\n</button>',
          explanation:
            'ARIA labels provide accessible names for elements that lack visible text. Screen readers use these to describe controls.',
        },
        {
          title: 'Add ARIA Labels to Navigation',
          before: '<nav>\n  <a href="/">Home</a>\n  <a href="/about">About</a>\n</nav>',
          after: '<nav aria-label="Main navigation">\n  <a href="/">Home</a>\n  <a href="/about">About</a>\n</nav>',
          explanation:
            'Labeling navigation regions helps screen reader users jump to the correct section quickly.',
        },
      ];
    });

    // ── Performance ──
    this.register('PERF001', (_check: AuditCheck, ctx: SeoRuleContext) => {
      return [
        {
          title: 'Inline CSS Alternatives',
          before: '<p style="color: red; font-size: 16px; margin: 10px 0;">Text</p>',
          after: '<p class="highlight">Text</p>\n\n<!-- In your CSS file: -->\n<!-- .highlight { color: red; font-size: 16px; margin: 10px 0; } -->',
          explanation:
            'Move inline styles to an external stylesheet. This reduces HTML size, improves cacheability, and makes maintenance easier.',
        },
      ];
    });

    this.register('PERF002', (_check: AuditCheck, ctx: SeoRuleContext) => {
      return [
        {
          title: 'Defer Non-Critical Scripts',
          before: '<script src="analytics.js"></script>\n<script src="chat-widget.js"></script>',
          after: '<script src="analytics.js" defer></script>\n<script src="chat-widget.js" defer></script>',
          explanation:
            'Use the `defer` attribute so scripts load in the background without blocking page rendering. This improves LCP and TBT.',
        },
        {
          title: 'Move Scripts to the Bottom',
          before: '<head>\n  <script src="app.js"></script>\n</head>',
          after: '<body>\n  <!-- Content -->\n  <script src="app.js"></script>\n</body>',
          explanation:
            'Place non-critical scripts just before </body> so they don\'t block the initial page render.',
        },
      ];
    });
  }

  private register(id: string, generator: FixExampleGenerator): void {
    this.generators.set(id, generator);
  }
}

type FixExampleGenerator = (
  check: AuditCheck,
  context: SeoRuleContext
) => FixExample[];
