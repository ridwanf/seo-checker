import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import type { AuditCheck } from '@seo-checker/shared-types'
import { IssueRow } from './IssueRow'
import { getCategoryLabel, getSeverityVariant } from '@/utils/formatters'
import { Badge } from '@/components/common/Badge'

type Filter = 'issues' | 'passed' | 'all'

interface IssueTableProps {
  checks: AuditCheck[]
}

export function IssueTable({ checks }: IssueTableProps) {
  const [filter, setFilter] = useState<Filter>('issues')
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'severity', desc: true },
  ])

  const failed = checks.filter((c) => !c.passed)
  const passed = checks.filter((c) => c.passed)

  const displayed =
    filter === 'issues' ? failed : filter === 'passed' ? passed : checks

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'issues', label: 'Issues', count: failed.length },
    { key: 'passed', label: 'Passed', count: passed.length },
    { key: 'all', label: 'All Checks', count: checks.length },
  ]

  const severityWeight: Record<string, number> = {
    critical: 3,
    major: 2,
    minor: 1,
  }

  const columnHelper = createColumnHelper<AuditCheck>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => (
          <code className="text-xs text-zinc-500">{info.getValue()}</code>
        ),
      }),
      columnHelper.accessor('rule', {
        header: 'Rule',
        cell: (info) => (
          <span className="text-sm font-medium text-white">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('severity', {
        header: 'Severity',
        sortingFn: (a, b) => {
          const wa = severityWeight[a.original.severity ?? ''] ?? 0
          const wb = severityWeight[b.original.severity ?? ''] ?? 0
          return wa - wb
        },
        cell: (info) => {
          const s = info.getValue()
          if (!s) return null
          return <Badge variant={getSeverityVariant(s)}>{s}</Badge>
        },
      }),
      columnHelper.accessor('category', {
        header: 'Category',
        cell: (info) => (
          <Badge variant="info">{getCategoryLabel(info.getValue())}</Badge>
        ),
      }),
      columnHelper.accessor('passed', {
        header: 'Status',
        cell: (info) =>
          info.getValue() ? (
            <span className="text-emerald-400 text-xs font-medium">✓ Passed</span>
          ) : (
            <span className="text-red-400 text-xs font-medium">✗ Failed</span>
          ),
      }),
    ],
    [],
  )

  const table = useReactTable({
    data: displayed,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const sortIndicator = (sorted: boolean | 'asc' | 'desc') => {
    if (!sorted) return null
    return <span className="ml-1 text-xs opacity-60">{sorted === 'desc' ? '▼' : '▲'}</span>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-3 border-b border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-60">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Sortable Table Header — only for 'all' and 'passed' views */}
      {filter !== 'issues' && displayed.length > 0 && (
        <div className="hidden md:flex items-center gap-3 px-5 py-2 bg-zinc-800/40 border-b border-zinc-800/50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          {table.getHeaderGroups().map((hg) =>
            hg.headers.map((header) => (
              <button
                key={header.id}
                className={`flex-1 text-left hover:text-zinc-300 transition-colors ${
                  header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                }`}
                onClick={header.column.getToggleSortingHandler()}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
                {sortIndicator(header.column.getIsSorted())}
              </button>
            )),
          )}
        </div>
      )}

      {/* Rows */}
      <AnimatePresence mode="wait">
        {displayed.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center text-zinc-500 text-sm"
          >
            No {filter === 'issues' ? 'issues' : filter} found
          </motion.div>
        ) : (
          <motion.div key={filter}>
            {displayed.map((check) => (
              <IssueRow key={check.id} check={check} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
