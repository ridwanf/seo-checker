import { Card } from '@/components/common/Card'
import type { AuditReport } from '@seo-checker/shared-types'

interface ScoreBreakdownProps {
  scoreBreakdown: AuditReport['scoreBreakdown']
}

export function ScoreBreakdown({ scoreBreakdown }: ScoreBreakdownProps) {
  const { earnedWeight, totalWeight, percentage } = scoreBreakdown

  return (
    <Card>
      <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
        Score Breakdown
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Earned Weight</span>
          <span className="text-white font-medium">{earnedWeight}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Total Weight</span>
          <span className="text-white font-medium">{totalWeight}</span>
        </div>
        <div className="h-px bg-zinc-800" />
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-400">Final Score</span>
          <span className="text-white font-bold">{percentage}%</span>
        </div>
      </div>
    </Card>
  )
}