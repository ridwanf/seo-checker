import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card } from '@/components/common/Card'
import { getCategoryLabel, getScoreGrade } from '@/utils/formatters'
import type { AuditCategory } from '@seo-checker/shared-types'

interface CategoryCardProps {
  categories: AuditCategory[]
}

export function CategoryCard({ categories }: CategoryCardProps) {
  const data = categories
    .map((cat) => ({
      name: getCategoryLabel(cat.category),
      score: cat.score,
      weight: `${cat.earnedWeight}/${cat.totalWeight}`,
      fill: getScoreGrade(cat.score).ring,
    }))
    .reverse() // So first category appears at top

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const row = payload[0].payload
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 shadow-xl">
        <p className="text-sm font-medium text-white">{row.name}</p>
        <p className="text-xs text-zinc-400 mt-0.5">
          Score: <span className="font-semibold text-white">{row.score}%</span>
        </p>
        <p className="text-xs text-zinc-400">
          Weight: <span className="font-semibold text-white">{row.weight}</span>
        </p>
      </div>
    )
  }

  return (
    <Card>
      <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-5">
        Category Scores
      </h2>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={data}
          layout="vertical"
          barSize={20}
          barGap={4}
          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            hide
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: '#a1a1aa',
              fontSize: 12,
              textAnchor: 'start',
            }}
            width={90}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'hsl(222 30% 14%)' }}
          />
          <Bar
            dataKey="score"
            radius={[0, 6, 6, 0]}
            animationDuration={1200}
            animationEasing="ease-out"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Compact fallback for mobile */}
      <div className="md:hidden space-y-3 mt-4">
        {categories.map((cat) => {
          const { color, bar } = getScoreGrade(cat.score)
          return (
            <div key={cat.category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-zinc-300">
                  {getCategoryLabel(cat.category)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">
                    {cat.earnedWeight}/{cat.totalWeight}
                  </span>
                  <span className={`text-sm font-bold w-8 text-right ${color}`}>
                    {cat.score}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${bar} rounded-full transition-all duration-700`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
