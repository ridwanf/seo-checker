import { Card } from '@/components/common/Card'
import { getScoreGrade } from '@/utils/formatters'
import type { AuditReport } from '@seo-checker/shared-types'

interface ScoreCardProps {
  score: number
  summary: AuditReport['summary']
}

export function ScoreCard({ score, summary }: ScoreCardProps) {
  const { grade, color, ring } = getScoreGrade(score)
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <Card className="flex flex-col items-center gap-5">
      <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider self-start">
        Overall Score
      </h2>

      {/* Gauge */}
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle
            cx="70" cy="70" r={radius}
            fill="none" stroke="#27272a" strokeWidth="10"
          />
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke={ring}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{score}</span>
          <span className="text-xs text-zinc-500">/ 100</span>
        </div>
      </div>

      <span className={`text-2xl font-bold ${color}`}>Grade {grade}</span>

      {/* Summary stats */}
      <div className="w-full grid grid-cols-3 gap-2 text-center">
        <div className="bg-zinc-800 rounded-lg p-2">
          <div className="text-emerald-400 font-bold text-xl">{summary.passed}</div>
          <div className="text-zinc-500 text-xs">Passed</div>
        </div>
        <div className="bg-zinc-800 rounded-lg p-2">
          <div className="text-red-400 font-bold text-xl">{summary.failed}</div>
          <div className="text-zinc-500 text-xs">Failed</div>
        </div>
        <div className="bg-zinc-800 rounded-lg p-2">
          <div className="text-yellow-400 font-bold text-xl">{summary.warnings}</div>
          <div className="text-zinc-500 text-xs">Warnings</div>
        </div>
      </div>
    </Card>
  )
}