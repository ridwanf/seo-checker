const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-4',
}

export function Spinner({ size = 'md' }: { size?: keyof typeof sizes }) {
  return (
    <div
      className={`${sizes[size]} border-purple-500 border-t-transparent rounded-full animate-spin`}
    />
  )
}