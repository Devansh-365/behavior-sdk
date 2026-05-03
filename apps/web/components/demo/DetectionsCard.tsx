'use client'

import type { ReactElement } from 'react'
import { useState } from 'react'
import { Code2, Shield, ShieldAlert } from 'lucide-react'
import {
  DETECTION_DISPLAY_LABELS,
  type Detections,
  type DetectionResult,
} from "@devanshhq/nyasa";

interface DetectionsCardProps {
  detections: Detections | null
}

/** Same order as `Detections` in the SDK payload. */
const RULE_KEYS: Array<keyof Detections> = [
  'isHeadless',
  'isScripted',
  'isLLMAgent',
  'isAuthorizedAgent',
  'isUploadAutomation',
  'isMultimodalBot',
]

const RULE_BLURBS: Record<keyof Detections, string> = {
  isHeadless:
    'WebDriver/CDP markers, iframe mismatch, software WebGL renderer',
  isScripted:
    'Uniform keystrokes, missing pointer activity, scripted input events',
  isLLMAgent:
    'Paste-heavy flow, machine-speed bursts, center-precise clicks, LLM rhythm',
  isAuthorizedAgent:
    'Cryptographic agent attestation when implemented (HTTP message signatures)',
  isUploadAutomation:
    'Programmatic file attach or doc metadata hints (EXIF / synthetic tooling)',
  isMultimodalBot:
    'Conflicting behavioral channels (e.g. natural mouse vs pixel-perfect clicks)',
}

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
  ruleKey,
  title,
  blurb,
  result,
  showPayloadKeys,
}: {
  ruleKey: keyof Detections
  title: string
  blurb: string
  result: DetectionResult | undefined
  showPayloadKeys: boolean
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
            <div className="text-foreground text-sm font-medium">{title}</div>
            {showPayloadKeys ? (
              <div className="text-muted-foreground font-mono text-[10px] tracking-tight">
                {ruleKey}
              </div>
            ) : null}
            <div className="text-muted-foreground mt-0.5 text-xs">{blurb}</div>
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
  const [showPayloadKeys, setShowPayloadKeys] = useState(false)
  const anyFired = detections
    ? Object.values(detections).some((r) => r.detected)
    : false
  const Icon = anyFired ? ShieldAlert : Shield
  const iconColor = anyFired
    ? 'text-destructive'
    : 'text-emerald-600 dark:text-emerald-400'

  return (
    <section className="border-border bg-card overflow-hidden rounded-2xl border p-5 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
          <Icon className={`size-3.5 shrink-0 ${iconColor}`} aria-hidden />
          Detections
        </h3>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <button
            type="button"
            className={`focus-visible:ring-ring inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              showPayloadKeys
                ? 'text-foreground border-border bg-muted/60'
                : 'text-muted-foreground hover:text-foreground border-transparent hover:border-border hover:bg-muted/50'
            }`}
            aria-pressed={showPayloadKeys}
            aria-expanded={showPayloadKeys}
            aria-label={
              showPayloadKeys
                ? 'Hide JSON payload field names for each rule'
                : 'Show JSON payload field names (e.g. isHeadless) for integrators'
            }
            onClick={() => {
              setShowPayloadKeys((v) => !v)
            }}
          >
            <Code2 className="size-3.5 shrink-0 opacity-80" aria-hidden />
            <span>Payload keys</span>
          </button>
          <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
            {anyFired ? 'fired' : 'all clear'}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        {RULE_KEYS.map((key) => (
          <DetectionRow
            key={key}
            ruleKey={key}
            title={DETECTION_DISPLAY_LABELS[key]}
            blurb={RULE_BLURBS[key]}
            result={detections?.[key]}
            showPayloadKeys={showPayloadKeys}
          />
        ))}
      </div>
    </section>
  )
}
