import { useState } from 'react'
import type { AuditCheck } from '@seo-checker/shared-types'
import { IssueRow } from './IssueRow'

type Filter = 'issues' | 'passed' | 'all'

interface IssueTableProps {
  checks: AuditCheck[]
}

export function IssueTable({ checks }: IssueTableProps) {
  const [filter, setFilter] = useState<Filter>('issues')

  const failed = checks.filter((c) => !c.passed)
  const passed = checks.filter((c) => c.passed)

  const displayed =
    filter === 'issues' ? failed : filter === 'passed' ? passed : checks

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'issues', label: 'Issues', count: failed.length },
    { key: 'passed', label: 'Passed', count: passed.length },
    { key: 'all', label: 'All Checks', count: checks.length },
  ]

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-3 border-b border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === tab.key
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-500 hover:text-zinc-200'
              }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-60">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Rows */}
      <div>
        {displayed.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-sm">
            No {filter === 'issues' ? 'issues' : filter} found
          </div>
        ) : (
          displayed.map((check) => <IssueRow key={check.id} check={check} />)
        )}
      </div>
    </div>
  )
}