import type { AuditCheck } from '@seo-checker/shared-types'
import { Lightbulb, Wrench } from 'lucide-react'

interface IssueRowProps {
  check: AuditCheck
}

export function IssueRow({ check }: IssueRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-6 py-4 bg-zinc-800/30 border-b border-zinc-800">
      {check.recommendation && (
        <div className="flex gap-3 rounded-lg bg-blue-500/5 border border-blue-500/10 p-3">
          <Wrench className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-400 mb-1">How to Fix</p>
            <p className="text-sm text-zinc-300">{check.recommendation}</p>
          </div>
        </div>
      )}
      {check.why && (
        <div className="flex gap-3 rounded-lg bg-purple-500/5 border border-purple-500/10 p-3">
          <Lightbulb className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-purple-400 mb-1">Why It Matters</p>
            <p className="text-sm text-zinc-300">{check.why}</p>
          </div>
        </div>
      )}
    </div>
  )
}