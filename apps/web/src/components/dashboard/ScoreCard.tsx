import { GaugeComponent } from 'react-gauge-component'
import { Card } from '@/components/common/Card'
import { getScoreGrade } from '@/utils/formatters'
import type { AuditReport } from '@seo-checker/shared-types'

interface ScoreCardProps {
  score: number
  summary: AuditReport['summary']
}

export function ScoreCard({ score, summary }: ScoreCardProps) {
  const { grade } = getScoreGrade(score)

  return (
    <Card className="flex flex-col items-center gap-5">
      <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider self-start">
        Overall Score
      </h2>

      <GaugeComponent
        type="semicircle"
        value={score}
        minValue={0}
        maxValue={100}
        marginInPercent={{ top: 0.05, bottom: 0, left: 0.05, right: 0.05 }}
        arc={{
          width: 0.18,
          padding: 0.005,
          cornerRadius: 3,
          subArcs: [
            { limit: 50, color: '#f87171', showTick: false },
            { limit: 60, color: '#fb923c', showTick: false },
            { limit: 70, color: '#facc15', showTick: false },
            { limit: 80, color: '#60a5fa', showTick: false },
            { limit: 100, color: '#34d399', showTick: false },
          ],
        }}
        pointer={{
          type: 'needle',
          color: '#e4e4e7',
          baseColor: '#e4e4e7',
          length: 0.65,
          animate: true,
          elastic: true,
          animationDuration: 1500,
          animationDelay: 200,
        }}
        labels={{
          valueLabel: {
            formatTextValue: (v) => `${v}`,
            style: {
              fontSize: '32px',
              fontWeight: 700,
              fill: '#e4e4e7',
            },
          },
          tickLabels: {
            type: 'outer',
            ticks: [
              { value: 0, valueConfig: { style: { fill: '#a1a1aa', fontSize: 10 } } },
              { value: 25, valueConfig: { style: { fill: '#a1a1aa', fontSize: 10 } } },
              { value: 50, valueConfig: { style: { fill: '#a1a1aa', fontSize: 10 } } },
              { value: 75, valueConfig: { style: { fill: '#a1a1aa', fontSize: 10 } } },
              { value: 100, valueConfig: { style: { fill: '#a1a1aa', fontSize: 10 } } },
            ],
          },
        }}
      />

      <span data-testid="summary-total" className={`text-xl font-bold ${getScoreGrade(score).color}`}>
        Grade {grade}
      </span>

      {/* Summary stats */}
      <div className="w-full grid grid-cols-3 gap-2 text-center">
        <div className="bg-zinc-800 rounded-lg p-3" data-testid="summary-passed" >
          <div className="text-emerald-400 font-bold text-xl">{summary.passed}</div>
          <div className="text-zinc-500 text-xs">Passed</div>
        </div>
        <div className="bg-zinc-800 rounded-lg p-3" data-testid="summary-failed">
          <div className="text-red-400 font-bold text-xl">{summary.failed}</div>
          <div className="text-zinc-500 text-xs">Failed</div>
        </div>
        <div className="bg-zinc-800 rounded-lg p-3" data-testid="summary-warnings">
          <div className="text-yellow-400 font-bold text-xl">{summary.warnings}</div>
          <div className="text-zinc-500 text-xs">Warnings</div>
        </div>
      </div>
    </Card>
  )
}