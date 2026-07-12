import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AuditCheck } from '@seo-checker/shared-types'
import { Badge } from '@/components/common/Badge'
import { getCategoryLabel, getSeverityVariant } from '@/utils/formatters'

interface IssueRowProps {
  check: AuditCheck
}

export function IssueRow({ check }: IssueRowProps) {
  const [expanded, setExpanded] = useState(false)

  // Passed check — collapsed row
  if (check.passed) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 px-5 py-3 border-b border-zinc-800/50 last:border-0"
      >
        <span className="text-emerald-400 text-sm shrink-0">✓</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-300 truncate">{check.rule}</p>
          <p className="text-xs text-zinc-500 truncate">{check.message}</p>
        </div>
        <Badge variant="info">{getCategoryLabel(check.category)}</Badge>
      </motion.div>
    )
  }

  const icon =
    check.severity === 'critical'
      ? '🔴'
      : check.severity === 'major'
        ? '🟠'
        : '🟡'

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-zinc-800/50 last:border-0"
    >
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
        <span className="text-zinc-600 text-xs ml-1 shrink-0 transition-transform duration-200"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
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

              {check.fixExamples && check.fixExamples.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                    Fix Examples ({check.fixExamples.length})
                  </p>
                  <div className="space-y-3">
                    {check.fixExamples.map((example, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden"
                      >
                        <div className="px-4 py-2 bg-zinc-800/40 border-b border-zinc-800">
                          <p className="text-sm font-medium text-white">
                            {i + 1}. {example.title}
                          </p>
                        </div>
                        <div className="p-4 space-y-3">
                          {example.before && (
                            <div>
                              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
                                ❌ Before
                              </p>
                              <pre className="text-xs text-zinc-300 bg-black/40 border border-zinc-800 rounded-lg p-3 overflow-x-auto leading-relaxed font-mono">
                                {example.before}
                              </pre>
                            </div>
                          )}
                          {example.after && (
                            <div>
                              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                                ✅ After
                              </p>
                              <pre className="text-xs text-zinc-300 bg-black/40 border border-zinc-800 rounded-lg p-3 overflow-x-auto leading-relaxed font-mono">
                                {example.after}
                              </pre>
                            </div>
                          )}
                          {example.explanation && (
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              💡 {example.explanation}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
