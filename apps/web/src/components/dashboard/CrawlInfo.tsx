import { Card } from '@/components/common/Card'
import { formatBytes, formatMs } from '@/utils/formatters'
import type { AuditReport } from '@seo-checker/shared-types'

interface CrawlInfoProps {
  crawl: AuditReport['crawl']
}

function Row({
  label,
  value,
  ok,
}: {
  label: string
  value: string
  ok?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-zinc-800 last:border-0">
      <span className="text-sm text-zinc-400">{label}</span>
      <span
        className={`text-sm font-medium ${ok === false ? 'text-red-400' : 'text-zinc-100'
          }`}
      >
        {value}
      </span>
    </div>
  )
}

export function CrawlInfo({ crawl }: CrawlInfoProps) {
  return (
    <Card className="!p-0">
      <div className="px-6 pt-5 pb-2">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Crawl Info
        </h2>
      </div>
      <div className="px-6 pb-4">
        <Row
          label="Status"
          value={crawl.status.toString()}
          ok={crawl.status >= 200 && crawl.status < 300}
        />
        <Row
          label="Response Time"
          value={formatMs(crawl.responseTime.total)}
          ok={crawl.responseTime.total < 2000}
        />
        <Row
          label="Page Size"
          value={formatBytes(crawl.pageSize)}
          ok={crawl.pageSize < 1_048_576}
        />
        <Row
          label="HTTPS"
          value={crawl.finalUrl.startsWith('https') ? '✓ Yes' : '✗ No'}
          ok={crawl.finalUrl.startsWith('https')}
        />
        <Row label="Protocol" value={crawl.protocol ?? 'HTTP/1.1'} />
        <Row label="Server" value={crawl.server ?? 'Unknown'} />
        <Row label="Encoding" value={crawl.encoding ?? 'None'} />
        <Row
          label="robots.txt"
          value={crawl.robots.found ? '✓ Found' : '✗ Not Found'}
          ok={crawl.robots.found}
        />
        <Row
          label="sitemap.xml"
          value={
            crawl.sitemap.found
              ? `✓ ${crawl.sitemap.urlCount ?? 0} URLs`
              : '✗ Not Found'
          }
          ok={crawl.sitemap.found}
        />
      </div>

      {/* Redirect Chain */}
      {crawl.redirectChain.length > 0 && (
        <div className="px-6 pb-5 border-t border-zinc-800 pt-4">
          <p className="text-xs text-zinc-500 mb-2">
            Redirect Chain ({crawl.redirectChain.length})
          </p>
          <div className="space-y-1">
            {crawl.redirectChain.map((url, i) => (
              <p key={i} className="text-xs text-zinc-400 truncate">
                {i + 1}. {url}
              </p>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}