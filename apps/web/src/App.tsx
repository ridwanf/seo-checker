import { HeroSection } from '@/components/layout/HeroSection'
import { useAuditStore } from '@/stores/audit.store'
import { ScoreCard } from '@/components/dashboard/ScoreCard'
import { CategoryCard } from '@/components/dashboard/CategoryCard'
import { CrawlInfo } from '@/components/dashboard/CrawlInfo'
import { ScoreBreakdown } from '@/components/dashboard/ScoreBreakdown'
import { IssueTable } from '@/components/report/IssueTable'
import { Spinner } from '@/components/common/Spinner'

export default function App() {
  const { report, isLoading, error, message } = useAuditStore()
  const allChecks = report?.categories.flatMap((c) => c.checks) ?? []

  const isEmpty = !report && !isLoading && !error

  return (
    <main className="flex-1 flex flex-col">
      {/* Hero with URL form */}
      <div className={isEmpty ? 'flex-1 flex flex-col justify-center' : ''}>
        <HeroSection />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center gap-4 py-24">
          <Spinner size="lg" />
          <div className="text-center">
            <p className="text-foreground font-medium">Crawling and analyzing...</p>
            <p className="text-muted-foreground text-sm mt-1">
              Fetching HTML, robots.txt, and sitemap.xml
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-6 py-4">
            <p className="text-destructive text-sm">⚠️ {message || error}</p>
          </div>
        </div>
      )}

      {/* Report */}
      {report && !isLoading && (
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
          {/* Analyzed URL */}
          <div className="flex items-center justify-between py-2 border-b border-border">
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
          </div>

          {/* Row 1: Score + Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScoreCard score={report.score} summary={report.summary} />
            <div className="md:col-span-2">
              <CategoryCard categories={report.categories} />
            </div>
          </div>

          {/* Row 2: Issues + Sidebar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <IssueTable checks={allChecks} />
            </div>
            <div className="space-y-6">
              <CrawlInfo crawl={report.crawl} />
              <ScoreBreakdown scoreBreakdown={report.scoreBreakdown} />
            </div>
          </div>
        </div>
      )}
    </main>
  )
}