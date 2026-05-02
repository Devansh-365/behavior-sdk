'use client'

import type { ReactElement } from 'react'
import {
  Bot,
  User,
  Brain,
  Eye,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import type { Verdict } from '@/lib/verdict'

interface VerdictCardProps {
  verdict: Verdict
}

const TONE_STYLES = {
  green: {
    bg: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    ring: 'ring-emerald-500/25',
    accent: 'text-emerald-600 dark:text-emerald-400',
    bar: 'bg-emerald-500 dark:bg-emerald-400',
    badge:
      'bg-emerald-500/10 text-emerald-800 ring-emerald-500/25 dark:text-emerald-300 dark:ring-emerald-500/30',
    iconBg:
      'from-emerald-500/20 to-emerald-500/5 ring-emerald-500/30 dark:from-emerald-400/30',
  },
  amber: {
    bg: 'from-amber-500/10 via-amber-500/5 to-transparent',
    ring: 'ring-amber-500/25',
    accent: 'text-amber-700 dark:text-amber-400',
    bar: 'bg-amber-500 dark:bg-amber-400',
    badge:
      'bg-amber-500/10 text-amber-900 ring-amber-500/25 dark:text-amber-300 dark:ring-amber-500/30',
    iconBg:
      'from-amber-500/20 to-amber-500/5 ring-amber-500/30 dark:from-amber-400/30',
  },
  red: {
    bg: 'from-rose-500/10 via-rose-500/5 to-transparent',
    ring: 'ring-rose-500/25',
    accent: 'text-rose-700 dark:text-rose-400',
    bar: 'bg-rose-500 dark:bg-rose-400',
    badge:
      'bg-rose-500/10 text-rose-900 ring-rose-500/25 dark:text-rose-300 dark:ring-rose-500/30',
    iconBg:
      'from-rose-500/20 to-rose-500/5 ring-rose-500/30 dark:from-rose-400/30',
  },
  slate: {
    bg: 'from-muted/60 via-muted/20 to-transparent',
    ring: 'ring-border',
    accent: 'text-muted-foreground',
    bar: 'bg-muted-foreground/50',
    badge: 'bg-muted text-muted-foreground ring-border',
    iconBg: 'from-muted/80 to-muted/20 ring-border',
  },
} as const

function VerdictIcon({
  kind,
  className,
}: {
  kind: Verdict['kind']
  className: string
}): ReactElement {
  switch (kind) {
    case 'human':
      return <User className={className} strokeWidth={1.75} />
    case 'headless':
      return <Eye className={className} strokeWidth={1.75} />
    case 'scripted':
      return <Bot className={className} strokeWidth={1.75} />
    case 'llm':
      return <Brain className={className} strokeWidth={1.75} />
    case 'multiple':
      return <AlertTriangle className={className} strokeWidth={1.75} />
    default:
      return <Loader2 className={`${className} animate-spin`} strokeWidth={1.75} />
  }
}

export function VerdictCard({ verdict }: VerdictCardProps): ReactElement {
  const tone = TONE_STYLES[verdict.tone]
  const isAnalyzing = verdict.kind === 'analyzing'
  const isHuman = verdict.kind === 'human'

  return (
    <section
      className={`border-border bg-card relative overflow-hidden rounded-2xl border p-6 shadow-sm ring-1 ring-inset ${tone.ring} transition-all duration-500 sm:p-7`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tone.bg}`}
      />
      <div className="relative">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 ring-inset ${tone.iconBg}`}
            >
              <VerdictIcon kind={verdict.kind} className={`size-7 ${tone.accent}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold uppercase tracking-[0.18em] ${tone.accent}`}
                >
                  {isAnalyzing ? 'Status' : 'Verdict'}
                </span>
                {!isAnalyzing && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${tone.badge}`}
                  >
                    {isHuman
                      ? 'no detection'
                      : `${verdict.firedRules.length} signal${verdict.firedRules.length === 1 ? '' : 's'}`}
                  </span>
                )}
              </div>
              <h2 className="text-foreground mt-1.5 text-3xl font-semibold tracking-tight sm:text-4xl">
                {verdict.shortLabel}
              </h2>
              <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
                {verdict.description}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-1.5">
            <div className="text-right">
              <div className="text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.45em] sm:tracking-[0.18em]">
                {isHuman ? 'Human confidence' : isAnalyzing ? '—' : 'Bot confidence'}
              </div>
              <div
                className={`font-mono text-4xl font-bold tabular-nums ${tone.accent} sm:text-5xl`}
              >
                {isAnalyzing ? '—' : verdict.confidence}
                {!isAnalyzing && (
                  <span className="text-muted-foreground text-xl">/100</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-muted mt-5 h-1.5 w-full overflow-hidden rounded-full">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${tone.bar}`}
            style={{ width: `${isAnalyzing ? 8 : verdict.confidence}%` }}
          />
        </div>
        {verdict.reasons.length > 0 && (
          <div className="border-border mt-5 border-t pt-4">
            <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-medium">
              <ShieldCheck className="size-3.5" aria-hidden />
              Why this verdict
            </div>
            <ul className="space-y-1.5">
              {verdict.reasons.map((reason, i) => (
                <li
                  key={i}
                  className="text-foreground flex items-start gap-2 font-mono text-xs leading-relaxed"
                >
                  <span className={`mt-1.5 size-1 shrink-0 rounded-full ${tone.bar}`} />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
