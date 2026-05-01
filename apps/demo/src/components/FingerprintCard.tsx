import { Fingerprint } from 'lucide-react'
import type { FingerprintSignals } from 'behavior-sdk'

interface FingerprintCardProps {
  fingerprint: FingerprintSignals | null
}

function Pill({ label, on }: { label: string; on: boolean }): JSX.Element {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] ring-1 ring-inset ${
        on
          ? 'bg-rose-500/15 text-rose-300 ring-rose-500/30'
          : 'bg-slate-800/40 text-slate-400 ring-slate-700/40'
      }`}
    >
      <span className={`size-1.5 rounded-full ${on ? 'bg-rose-400' : 'bg-slate-600'}`} />
      {label}
    </span>
  )
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s
}

export function FingerprintCard({ fingerprint }: FingerprintCardProps): JSX.Element {
  const fp = fingerprint
  const w = fp?.webdriver
  const i = fp?.iframe
  const c = fp?.canvas
  const g = fp?.webgl
  const a = fp?.audio
  const swiftshader = (g?.renderer ?? '').toLowerCase().includes('swiftshader')
  const llvmpipe = (g?.renderer ?? '').toLowerCase().includes('llvmpipe')

  return (
    <section className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Fingerprint className="size-3.5 text-cyan-400" />
          Fingerprint
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
          cached
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Pill label="navigator.webdriver" on={!!w?.webdriver} />
        <Pill label="CDP" on={!!w?.cdpPresent} />
        <Pill label="Playwright" on={!!w?.playwrightPresent} />
        <Pill label={`iframe ${i?.consistent ? 'consistent' : 'inconsistent'}`} on={i ? !i.consistent : false} />
        <Pill label="SwiftShader" on={swiftshader} />
        <Pill label="LLVMpipe" on={llvmpipe} />
      </div>

      <div className="mt-4 space-y-1.5 border-t border-slate-800/60 pt-3">
        <div className="flex items-start justify-between gap-3 text-xs">
          <span className="text-slate-400">WebGL renderer</span>
          <span className="text-right font-mono text-slate-200">
            {g?.supported ? truncate(g.renderer || g.vendor || 'hidden', 38) : 'unsupported'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Audio hash</span>
          <span className="font-mono text-slate-200">
            {a?.supported ? a.hash || '—' : 'pending'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Canvas hash</span>
          <span className="font-mono text-slate-200">
            {c?.supported ? c.hash || '—' : 'unsupported'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Plugins parent / iframe</span>
          <span className="font-mono text-slate-200">
            {i?.parentPluginCount ?? 0} / {i?.iframePluginCount ?? 0}
          </span>
        </div>
      </div>
    </section>
  )
}
