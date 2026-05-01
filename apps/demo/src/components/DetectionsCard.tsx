import { Shield, ShieldAlert } from 'lucide-react'
import type { Detections, DetectionResult } from 'behavior-sdk'

interface DetectionsCardProps {
  detections: Detections | null
}

const RULES: Array<{ key: keyof Detections; label: string; blurb: string }> = [
  { key: 'isHeadless', label: 'isHeadless', blurb: 'Headless browser markers' },
  { key: 'isScripted', label: 'isScripted', blurb: 'Mechanical input pattern' },
  { key: 'isLLMAgent', label: 'isLLMAgent', blurb: 'LLM-style paste-and-go' },
]

function severityClass(severity: DetectionResult['severity']): string {
  switch (severity) {
    case 'high':
      return 'bg-rose-500/15 text-rose-300 ring-rose-500/30'
    case 'medium':
      return 'bg-amber-500/15 text-amber-300 ring-amber-500/30'
    case 'low':
      return 'bg-slate-700/40 text-slate-300 ring-slate-700/60'
  }
}

function DetectionRow({
  label,
  blurb,
  result,
}: {
  label: string
  blurb: string
  result: DetectionResult | undefined
}): JSX.Element {
  const fired = result?.detected ?? false

  return (
    <div
      className={`rounded-lg border p-3 transition-all ${
        fired
          ? 'border-rose-500/40 bg-rose-500/5 fire-pulse'
          : 'border-slate-800/60 bg-slate-900/30'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span
            className={`mt-1 size-2 shrink-0 rounded-full ${
              fired ? 'bg-rose-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]' : 'bg-emerald-500/70'
            }`}
            aria-hidden
          />
          <div>
            <div className="font-mono text-sm text-slate-100">{label}</div>
            <div className="text-xs text-slate-500">{blurb}</div>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${
            fired ? severityClass(result?.severity ?? 'low') : 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
          }`}
        >
          {fired ? result?.severity : 'clear'}
        </span>
      </div>
      {fired && result && result.reasons.length > 0 && (
        <ul className="mt-2.5 space-y-1 border-t border-rose-500/10 pt-2 pl-4">
          {result.reasons.map((r, i) => (
            <li key={i} className="font-mono text-[11px] leading-relaxed text-rose-300/90">
              <span className="mr-1 text-rose-500/70">↳</span>
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function DetectionsCard({ detections }: DetectionsCardProps): JSX.Element {
  const anyFired = detections
    ? Object.values(detections).some((r) => r.detected)
    : false
  const Icon = anyFired ? ShieldAlert : Shield
  const iconColor = anyFired ? 'text-rose-400' : 'text-emerald-400'

  return (
    <section className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Icon className={`size-3.5 ${iconColor}`} />
          Detections
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
          {anyFired ? 'fired' : 'all clear'}
        </span>
      </div>

      <div className="space-y-2">
        {RULES.map((r) => (
          <DetectionRow
            key={r.key}
            label={r.label}
            blurb={r.blurb}
            result={detections?.[r.key]}
          />
        ))}
      </div>
    </section>
  )
}
