import { useRef, useTransition } from 'react'
import { useAuditStore } from '@/stores/audit.store'
import { Spinner } from '@/components/common/Spinner'
import { useAudit } from '@/hooks/userAudit'

export function HeroSection() {
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const { mutate: analyze } = useAudit()
  const { isLoading } = useAuditStore()

  const loading = isLoading || isPending

  // React 19 - useActionState for form handling
  async function handleAction(formData: FormData) {
    const url = formData.get('url') as string
    if (!url?.trim()) return

    startTransition(() => {
      analyze(url.trim())
      formRef.current?.reset()
    })
  }

  return (
    <section className="relative flex justify-center overflow-hidden section-padding pt-64">
      {/* Background */}
      <div className="absolute inset-0">
        {/* <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover opacity-30"
        /> */}
      </div>

      {/* Glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl text-center space-y-6">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Professional SEO Analysis
          </span>

          {/* ✅ Single clean H1 for SEO */}
          <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
            Audit Your Website in Seconds
          </h1>

          {/* Visual styling separate from H1 */}
          <p className="text-2xl md:text-3xl glow-text font-semibold">
            Free SEO Analysis Tool
          </p>

          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Get a full SEO report with scores, recommendations, and
            crawl insights — all in one place.
          </p>
        </div>

        {/* React 19 Form with action */}
        <form
          ref={formRef}
          action={handleAction}
          className="relative flex flex-wrap items-center gap-2 mt-8"
        >
          <input
            name="url"
            type="url"
            placeholder="https://example.com"
            required
            disabled={loading}
            className="flex-1 px-5 py-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="
            w-full

            md:w-auto
            glow-button 
            shrink-0 flex items-center 
            gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className='flex align-middle justify-center w-full'>

              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Analyze</span>
                  <span>→</span>
                </>
              )}
            </div>
          </button>
        </form>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
          <span className="flex items-center gap-1.5">
            <span className="text-primary">✓</span>
            Free Analysis
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-primary">✓</span>
            No Sign-up Required
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-primary">✓</span>
            Instant Results
          </span>
        </div>
      </div>
    </section>
  )
}