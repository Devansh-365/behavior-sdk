import { Bot, User, Brain, Eye, AlertTriangle, Loader2, ShieldCheck } from 'lucide-react'
import type { Verdict } from '../lib/verdict'

interface VerdictCardProps {
  verdict: Verdict
}

const TONE_STYLES = {
  green: {
    bg: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    ring: 'ring-emerald-500/30',
    accent: 'text-emerald-400',
    bar: 'bg-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
    iconBg: 'from-emerald-400/30 to-emerald-400/5 ring-emerald-400/40',
  },
  amber: {
    bg: 'from-amber-500/10 via-amber-500/5 to-transparent',
    ring: 'ring-amber-500/30',
    accent: 'text-amber-400',
    bar: 'bg-amber-400',
    badge: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
    iconBg: 'from-amber-400/30 to-amber-400/5 ring-amber-400/40',
  },
  red: {
    bg: 'from-rose-500/12 via-rose-500/5 to-transparent',
    ring: 'ring-rose-500/30',
    accent: 'text-rose-400',
    bar: 'bg-rose-400',
    badge: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
    iconBg: 'from-rose-400/30 to-rose-400/5 ring-rose-400/40',
  },
  slate: {
    bg: 'from-slate-500/5 via-transparent to-transparent',
    ring: 'ring-slate-700/60',
    accent: 'text-slate-400',
    bar: 'bg-slate-500',
    badge: 'bg-slate-700/40 text-slate-400 ring-slate-700/60',
    iconBg: 'from-slate-700/40 to-slate-700/5 ring-slate-700/40',
  },
} as const

function VerdictIcon({ kind, className }: { kind: Verdict['kind']; className: string }): JSX.Element {
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

export function VerdictCard({ verdict }: VerdictCardProps): JSX.Element {
  const tone = TONE_STYLES[verdict.tone]
  const isAnalyzing = verdict.kind === 'analyzing'
  const isHuman = verdict.kind === 'human'

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 ring-1 ring-inset ${tone.ring} transition-all duration-500 sm:p-7`}
    >
      {/* gradient wash */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tone.bg}`} />

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
                <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${tone.accent}`}>
                  {isAnalyzing ? 'Status' : isHuman ? 'Verdict' : 'Verdict'}
                </span>
                {!isAnalyzing && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${tone.badge}`}
                  >
                    {isHuman ? 'no detection' : `${verdict.firedRules.length} signal${verdict.firedRules.length === 1 ? '' : 's'}`}
                  </span>
                )}
              </div>
              <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
                {verdict.shortLabel}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
                {verdict.description}
              </p>
            </div>
          </div>

          {/* Confidence dial */}
          <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-1.5">
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {isHuman ? 'Human confidence' : isAnalyzing ? '—' : 'Bot confidence'}
              </div>
              <div className={`font-mono text-4xl font-bold tabular-nums ${tone.accent} sm:text-5xl`}>
                {isAnalyzing ? '—' : verdict.confidence}
                {!isAnalyzing && <span className="text-xl text-slate-500">/100</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800/60">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${tone.bar}`}
            style={{ width: `${isAnalyzing ? 8 : verdict.confidence}%` }}
          />
        </div>

        {/* Reasons */}
        {verdict.reasons.length > 0 && (
          <div className="mt-5 border-t border-slate-800/60 pt-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
              <ShieldCheck className="size-3.5" />
              Why this verdict
            </div>
            <ul className="space-y-1.5">
              {verdict.reasons.map((reason, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 font-mono text-xs leading-relaxed text-slate-300"
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
