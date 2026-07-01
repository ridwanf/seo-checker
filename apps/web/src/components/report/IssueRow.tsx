import { useState } from 'react'
import type { AuditCheck } from '@seo-checker/shared-types'
import { Badge } from '@/components/common/Badge'
import { getCategoryLabel, getSeverityVariant } from '@/utils/formatters'

interface IssueRowProps {
  check: AuditCheck
}

export function IssueRow({ check }: IssueRowProps) {
  const [expanded, setExpanded] = useState(false)

  // Passed check
  if (check.passed) {
    return (
      <div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-800/50 last:border-0">
        <span className="text-emerald-400 text-sm shrink-0">✓</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-300 truncate">{check.rule}</p>
          <p className="text-xs text-zinc-500 truncate">{check.message}</p>
        </div>
        <Badge variant="info">{getCategoryLabel(check.category)}</Badge>
      </div>
    )
  }

  const icon =
    check.severity === 'critical'
      ? '🔴'
      : check.severity === 'major'
        ? '🟠'
        : '🟡'

  return (
    <div className="border-b border-zinc-800/50 last:border-0">
      <button
        className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-zinc-800/40 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-sm shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <code className="text-xs text-zinc-500">{check.id}</code>
            <span className="text-sm font-medium text-white truncate">
              {check.rule}
            </span>
          </div>
          <p className="text-xs text-zinc-400 truncate">{check.message}</p>
        </div>
        <Badge variant={getSeverityVariant(check.severity)}>
          {check.severity}
        </Badge>
        <span className="text-zinc-600 text-xs ml-1 shrink-0">
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 bg-zinc-800/20">
          {check.why && (
            <div className="pt-3">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                Why it matters
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">{check.why}</p>
            </div>
          )}
          {check.recommendation && (
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                How to fix
              </p>
              <p className="text-sm text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 leading-relaxed">
                {check.recommendation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}