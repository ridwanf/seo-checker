export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

export interface ScoreGrade {
  grade: string
  color: string
  bar: string
  ring: string
}

export function getScoreGrade(score: number): ScoreGrade {
  if (score >= 90)
    return { grade: 'A', color: 'text-emerald-400', bar: 'bg-emerald-400', ring: '#34d399' }
  if (score >= 80)
    return { grade: 'B', color: 'text-blue-400', bar: 'bg-blue-400', ring: '#60a5fa' }
  if (score >= 70)
    return { grade: 'C', color: 'text-yellow-400', bar: 'bg-yellow-400', ring: '#facc15' }
  if (score >= 60)
    return { grade: 'D', color: 'text-orange-400', bar: 'bg-orange-400', ring: '#fb923c' }
  return { grade: 'F', color: 'text-red-400', bar: 'bg-red-400', ring: '#f87171' }
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'meta-tags': 'Meta Tags',
    content: 'Content',
    technical: 'Technical',
    social: 'Social',
    performance: 'Performance',
    accessibility: 'Accessibility',
  }
  return labels[category] ?? category
}

export function getSeverityVariant(
  severity?: string
): 'critical' | 'major' | 'minor' | 'success' {
  switch (severity) {
    case 'critical': return 'critical'
    case 'major': return 'major'
    case 'minor': return 'minor'
    default: return 'success'
  }
}