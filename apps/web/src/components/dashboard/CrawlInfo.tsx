import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { formatBytes, formatMs } from '@/utils/formatters'
import type { AuditReport } from '@seo-checker/shared-types'

interface CrawlInfoProps {
  crawl: AuditReport['crawl']
}

const rowVariant = {
  hidden: { opacity: 0, x: -10 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.3 },
  }),
}

function Row({
  label,
  value,
  ok,
  index = 0,
}: {
  label: string
  value: string
  ok?: boolean
  index?: number
}) {
  return (
    <motion.div
      custom={index}
      variants={rowVariant}
      initial="hidden"
      animate="show"
      className="flex items-center justify-between py-2.5 border-b border-zinc-800 last:border-0"
    >
      <span className="text-sm text-zinc-400">{label}</span>
      <span
        className={`text-sm font-medium ${ok === false ? 'text-red-400' : 'text-zinc-100'
          }`}
      >
        {value}
      </span>
    </motion.div>
  )
}

export function CrawlInfo({ crawl }: CrawlInfoProps) {
  const rows = [
    { label: 'Status', value: crawl.status.toString(), ok: crawl.status >= 200 && crawl.status < 300 },
    { label: 'Response Time', value: formatMs(crawl.responseTime.total), ok: crawl.responseTime.total < 2000 },
    { label: 'Page Size', value: formatBytes(crawl.pageSize), ok: crawl.pageSize < 1_048_576 },
    { label: 'HTTPS', value: crawl.finalUrl.startsWith('https') ? '✓ Yes' : '✗ No', ok: crawl.finalUrl.startsWith('https') },
    { label: 'Protocol', value: crawl.protocol ?? 'HTTP/1.1' },
    { label: 'Server', value: crawl.server ?? 'Unknown' },
    { label: 'Encoding', value: crawl.encoding ?? 'None' },
    { label: 'robots.txt', value: crawl.robots.found ? '✓ Found' : '✗ Not Found', ok: crawl.robots.found },
    { label: 'sitemap.xml', value: crawl.sitemap.found ? `✓ ${crawl.sitemap.urlCount ?? 0} URLs` : '✗ Not Found', ok: crawl.sitemap.found },
  ]

  return (
    <Card className="!p-0">
      <div className="px-6 pt-5 pb-2">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Crawl Info
        </h2>
      </div>
      <div className="px-6 pb-4">
        {rows.map((row, i) => (
          <Row key={row.label} {...row} index={i} />
        ))}
      </div>

      {/* Redirect Chain */}
      {crawl.redirectChain.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="px-6 pb-5 border-t border-zinc-800 pt-4"
        >
          <p className="text-xs text-zinc-500 mb-2">
            Redirect Chain ({crawl.redirectChain.length})
          </p>
          <div className="space-y-1">
            {crawl.redirectChain.map((url, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-xs text-zinc-400 truncate"
              >
                {i + 1}. {url}
              </motion.p>
            ))}
          </div>
        </motion.div>
      )}
    </Card>
  )
}