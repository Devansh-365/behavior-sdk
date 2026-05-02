'use client'

import type { ReactElement } from 'react'
import { Shield, ShieldAlert } from 'lucide-react'
import type { Detections, DetectionResult } from "@devanshhq/nyasa";

interface DetectionsCardProps {
  detections: Detections | null
}

const RULES: Array<{ key: keyof Detections; label: string; blurb: string }> = [
  { key: 'isHeadless', label: 'isHeadless', blurb: 'Headless browser markers' },
  { key: 'isScripted', label: 'isScripted', blurb: 'Mechanical input pattern' },
  { key: 'isLLMAgent', label: 'isLLMAgent', blurb: 'LLM-style paste-and-go' },
  {
    key: 'isUploadAutomation',
    label: 'isUploadAutomation',
    blurb: 'Programmatic file attachment or AI-generated doc',
  },
  {
    key: 'isMultimodalBot',
    label: 'isMultimodalBot',
    blurb: 'Cross-signal behavioral incoherence',
  },
]

function severityClass(severity: DetectionResult['severity']): string {
  switch (severity) {
    case 'high':
      return 'bg-destructive/15 text-destructive ring-destructive/25 dark:bg-destructive/20 dark:text-destructive dark:ring-destructive/40'
    case 'medium':
      return 'bg-amber-500/12 text-amber-900 ring-amber-500/25 dark:text-amber-300 dark:ring-amber-500/35'
    case 'low':
      return 'bg-muted text-muted-foreground ring-border'
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
}): ReactElement {
  const fired = result?.detected ?? false
  return (
    <div
      className={`rounded-lg border p-3 transition-colors duration-200 ${
        fired
          ? 'border-destructive/35 bg-destructive/5 ring-destructive/10 ring-1 dark:border-destructive/40'
          : 'border-border bg-muted/30'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span
            className={`mt-1 size-2 shrink-0 rounded-full ${
              fired
                ? 'bg-destructive shadow-sm shadow-destructive/30'
                : 'bg-emerald-500/80 dark:bg-emerald-400/90'
            }`}
            aria-hidden
          />
          <div>
            <div className="text-foreground font-mono text-sm">{label}</div>
            <div className="text-muted-foreground text-xs">{blurb}</div>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${
            fired
              ? severityClass(result?.severity ?? 'low')
              : 'bg-emerald-500/10 text-emerald-800 ring-emerald-500/20 dark:text-emerald-400 dark:ring-emerald-500/25'
          }`}
        >
          {fired ? result?.severity : 'clear'}
        </span>
      </div>
      {fired && result && result.reasons.length > 0 && (
        <ul className="border-destructive/15 mt-2.5 space-y-1 border-t pt-2 pl-4">
          {result.reasons.map((r, i) => (
            <li
              key={i}
              className="text-destructive font-mono text-[11px] leading-relaxed dark:text-rose-300/95"
            >
              <span className="text-destructive/60 mr-1 dark:text-rose-500/70">
                {'> '}
              </span>
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function DetectionsCard({
  detections,
}: DetectionsCardProps): ReactElement {
  const anyFired = detections
    ? Object.values(detections).some((r) => r.detected)
    : false
  const Icon = anyFired ? ShieldAlert : Shield
  const iconColor = anyFired
    ? 'text-destructive'
    : 'text-emerald-600 dark:text-emerald-400'

  return (
    <section className="border-border bg-card rounded-xl border p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
          <Icon className={`size-3.5 shrink-0 ${iconColor}`} aria-hidden />
          Detections
        </h3>
        <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
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
