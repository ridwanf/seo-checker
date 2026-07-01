import { Card } from '@/components/common/Card'
import { getCategoryLabel, getScoreGrade } from '@/utils/formatters'
import type { AuditCategory } from '@seo-checker/shared-types'

interface CategoryCardProps {
  categories: AuditCategory[]
}

export function CategoryCard({ categories }: CategoryCardProps) {
  return (
    <Card>
      <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-5">
        Category Scores
      </h2>
      <div className="space-y-4">
        {categories.map((cat) => {
          const { color, bar } = getScoreGrade(cat.score)
          return (
            <div key={cat.category}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-zinc-300">
                  {getCategoryLabel(cat.category)}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-600">
                    {cat.earnedWeight}/{cat.totalWeight}
                  </span>
                  <span className={`text-sm font-bold w-10 text-right ${color}`}>
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