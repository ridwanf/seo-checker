import { useState } from 'react'
import type { AuditReport } from '@seo-checker/shared-types'
import { reportService, type ExportFormat } from '@/services/report.service'
import { downloadBlob, sanitizeFilename } from '@/utils/download'

interface ExportActionsProps {
  url: string
  report?: AuditReport | null
}

export function ExportActions({ url, report }: ExportActionsProps) {
  const [busy, setBusy] = useState<ExportFormat | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleExport(format: ExportFormat) {
    if (busy) return
    setBusy(format)
    setError(null)
    try {
      const blob = await reportService.exportReport(url, format, report ?? undefined)
      downloadBlob(blob, sanitizeFilename(url, format))
    } catch (err) {
      console.error('Export failed:', err)
      setError('Export gagal, coba lagi.')
    } finally {
      setBusy(null)
    }
  }

  const btnClass =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-destructive">{error}</span>}
      <button
        type="button"
        className={btnClass}
        disabled={busy !== null}
        onClick={() => handleExport('pdf')}
      >
        {busy === 'pdf' ? 'Membuat PDF…' : '⬇ PDF'}
      </button>
      <button
        type="button"
        className={btnClass}
        disabled={busy !== null}
        onClick={() => handleExport('csv')}
      >
        {busy === 'csv' ? 'Membuat CSV…' : '⬇ CSV'}
      </button>
      <button
        type="button"
        className={btnClass}
        disabled={busy !== null}
        onClick={() => handleExport('json')}
      >
        {busy === 'json' ? 'Membuat Json…' : '⬇ Json'}
      </button>
    </div>
  )
}