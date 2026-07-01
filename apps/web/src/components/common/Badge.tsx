type Variant = 'critical' | 'major' | 'minor' | 'success' | 'info'

const styles: Record<Variant, string> = {
  critical: 'bg-red-400/10 text-red-400 border-red-400/20',
  major: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
  minor: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  success: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  info: 'bg-zinc-400/10 text-zinc-400 border-zinc-400/20',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
}

export function Badge({ children, variant = 'info' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[variant]}`}
    >
      {children}
    </span>
  )
}