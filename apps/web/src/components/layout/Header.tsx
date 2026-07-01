import { useAuditStore } from '@/stores/audit.store'

export function Header() {
  const { report, reset } = useAuditStore()

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm rounded-none">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="font-bold text-white">SEO Checker</span>

        {report && (
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500">
              v{report.version} · {new Date(report.createdAt).toLocaleTimeString()}
            </span>
            <button
              onClick={reset}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              New Analysis →
            </button>
          </div>
        )}
      </div>
    </header >
  )
}