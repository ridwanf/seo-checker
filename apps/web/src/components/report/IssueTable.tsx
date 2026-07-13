import { Fragment, useMemo, useState } from 'react'
import type { AuditCheck } from '@seo-checker/shared-types'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { ChevronDown, ChevronsUpDown, ChevronUp, Search } from 'lucide-react'
import { IssueRow } from './IssueRow'

type Filter = 'issues' | 'passed' | 'all'

interface IssueTableProps {
  checks: AuditCheck[]
}

const columnHelper = createColumnHelper<AuditCheck>()

const severityOrder: Record<string, number> = {
  critical: 0,
  major: 1,
  minor: 2,
}
const severityBadge: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border border-red-500/20',
  major: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  minor: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
}


export function IssueTable({ checks }: IssueTableProps) {
  const [filter, setFilter] = useState<Filter>('issues')
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const failed = checks.filter((c) => !c.passed)
  const passed = checks.filter((c) => c.passed)


  const tableData = useMemo(() => {
    if (filter === 'issues') return failed
    if (filter === 'passed') return passed
    return checks
  }, [filter, checks])

  const displayed =
    filter === 'issues' ? failed : filter === 'passed' ? passed : checks

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'issues', label: 'Issues', count: failed.length },
    { key: 'passed', label: 'Passed', count: passed.length },
    { key: 'all', label: 'All Checks', count: checks.length },
  ]

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }
  const handleFilterChange = (newFilter: Filter) => {
    setFilter(newFilter)
    setGlobalFilter('') // Clear search on tab change
    setExpandedRows(new Set()) // Collapse all rows
  }
  const columns = [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: (info) => (
        <span className="font-mono text-xs text-zinc-500">{info.getValue()}</span>
      ),
      size: 90,
    }),
    columnHelper.accessor('rule', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-white transition-colors"
          onClick={() => column.toggleSorting()}
        >
          RULE
          {column.getIsSorted() === 'asc' ? (
            <ChevronUp className="h-3 w-3" />
          ) : column.getIsSorted() === 'desc' ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronsUpDown className="h-3 w-3 text-zinc-600" />
          )}
        </button>
      ),
      cell: (info) => (
        <span className="font-medium text-sm">{info.getValue()}</span>
      )
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: (info) => (
        <span className="capitalize text-zinc-400 text-sm">
          {info.getValue()?.replace('-', ' ')}
        </span>
      ),
    }),
    columnHelper.accessor('severity', {
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 hover:text-white transition-colors"
          onClick={() => column.toggleSorting()}
        >
          SEVERITY
          {column.getIsSorted() === 'asc' ? (
            <ChevronUp className="h-3 w-3" />
          ) : column.getIsSorted() === 'desc' ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronsUpDown className="h-3 w-3 text-zinc-600" />
          )}
        </button>
      ),
      cell: (info) => {
        const severity = info.getValue()
        if (!severity) return <span className="text-zinc-600 text-sm">—</span>
        return (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${severityBadge[severity]}`}>
            {severity}
          </span>
        )
      },
      sortingFn: (a, b) => {
        const aOrder = a.original.severity !== undefined
          ? severityOrder[a.original.severity]
          : 999
        const bOrder = b.original.severity !== undefined
          ? severityOrder[b.original.severity]
          : 999
        return aOrder - bOrder
      },
    }),
    columnHelper.accessor('message', {
      header: 'Message',
      cell: (info) => (
        <span className="text-sm text-zinc-400 line-clamp-1">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('passed', {
      header: 'Status',
      cell: (info) =>
        info.getValue() ? (
          <span className="text-green-400 text-sm font-medium">✓ Passed</span>
        ) : (
          <span className="text-red-400 text-sm font-medium">✗ Failed</span>
        ),
    }),
  ]


  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => row.id, // Use stable row ID
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId)
      return String(value ?? '')
        .toLowerCase()
        .includes(String(filterValue).toLowerCase())
    },
    initialState: {
      sorting: [{ id: 'severity', desc: false }],
    },
  })


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div
        data-testid="issues-table"
        className="flex flex-col gap-3 px-4 py-3 border-b border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleFilterChange(tab.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === tab.key
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${filter === tab.key
                ? 'bg-zinc-600 text-zinc-200'
                : 'bg-zinc-800 text-zinc-500'
                }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search rules..."
            className="w-full sm:w-48 pl-8 pr-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              {table.getHeaderGroups().map((hg) =>
                hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-zinc-500">
                    No results found
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, i) => {
                  const check = row.original
                  const isExpanded = expandedRows.has(check.id)

                  return (
                    <Fragment key={row.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => !check.passed && toggleRow(check.id)}
                        className={`border-b border-zinc-800/50 transition-colors ${!check.passed
                          ? 'cursor-pointer hover:bg-zinc-800/50'
                          : 'opacity-60'
                          }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </motion.tr>
                      {/* Expanded Row */}
                      <AnimatePresence>
                        {isExpanded && !check.passed && (
                          <tr>
                            <td colSpan={columns.length} className="p-0">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <IssueRow check={check} />
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </Fragment>
                  )
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      {/* Footer */}
      <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
        <span>
          Showing {table.getRowModel().rows.length} of {displayed.length} results
        </span>
        <span>
          {failed.length} issues · {passed.length} passed
        </span>
      </div>
    </motion.div>
  )
}