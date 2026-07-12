import { motion } from 'framer-motion'
import { HeroSection } from '@/components/layout/HeroSection'
import { useAuditStore } from '@/stores/audit.store'
import { ScoreCard } from '@/components/dashboard/ScoreCard'
import { CategoryCard } from '@/components/dashboard/CategoryCard'
import { CrawlInfo } from '@/components/dashboard/CrawlInfo'
import { ScoreBreakdown } from '@/components/dashboard/ScoreBreakdown'
import { IssueTable } from '@/components/report/IssueTable'
import { Spinner } from '@/components/common/Spinner'
import { useEffect, useRef } from 'react'

export default function App() {
  const { report, isLoading, error, message } = useAuditStore()
  const allChecks = report?.categories.flatMap((c) => c.checks) ?? []
  const resultsRef = useRef<HTMLDivElement>(null)

  const isEmpty = !report && !isLoading && !error
  useEffect(() => {
    if (report || error) {
      resultsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [report, error])

  return (
    <main className="flex-1 flex flex-col">
      {/* Hero with URL form */}
      <div className={isEmpty ? 'flex-1 flex flex-col justify-center' : ''}>
        <HeroSection />
      </div>
      <div ref={resultsRef} />
      {/* Loading */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 py-24"
        >
          <Spinner size="lg" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <p className="text-foreground font-medium">Crawling and analyzing...</p>
            <p className="text-muted-foreground text-sm mt-1">
              Fetching HTML, robots.txt, and sitemap.xml
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-2xl mx-auto px-6 py-4"
        >
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-6 py-4">
            <p className="text-destructive text-sm">⚠️ {message || error}</p>
          </div>
        </motion.div>
      )}

      {/* Report */}
      {report && !isLoading && (
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
          {/* Analyzed URL */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between py-2 border-b border-border"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Analyzed</span>
              <a
                href={report.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline transition-colors"
              >
                {report.url}
              </a>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(report.createdAt).toLocaleString()}
            </span>
          </motion.div>

          {/* Row 1: Score + Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <ScoreCard score={report.score} summary={report.summary} />
            <div className="md:col-span-2">
              <CategoryCard categories={report.categories} />
            </div>
          </motion.div>

          {/* Row 2: Issues + Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="md:col-span-2">
              <IssueTable checks={allChecks} />
            </div>
            <div className="space-y-6">
              <CrawlInfo crawl={report.crawl} />
              <ScoreBreakdown scoreBreakdown={report.scoreBreakdown} />
            </div>
          </motion.div>
        </div>
      )}
    </main>
  )
}