'use client'

import type { ReactElement } from 'react'
import { AlertTriangle, Fingerprint } from 'lucide-react'
import type { FingerprintSignals } from 'behavior-sdk'

interface FingerprintCardProps {
  fingerprint: FingerprintSignals | null
}

function Pill({ label, on }: { label: string; on: boolean }): ReactElement {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] ring-1 ring-inset ${
        on
          ? 'bg-destructive/10 text-destructive ring-destructive/25 dark:bg-destructive/15 dark:text-rose-300 dark:ring-destructive/35'
          : 'bg-muted text-muted-foreground ring-border'
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${on ? 'bg-destructive' : 'bg-muted-foreground/50'}`}
      />
      {label}
    </span>
  )
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s
}

export function FingerprintCard({
  fingerprint,
}: FingerprintCardProps): ReactElement {
  const fp = fingerprint
  const w = fp?.webdriver
  const i = fp?.iframe
  const c = fp?.canvas
  const g = fp?.webgl
  const a = fp?.audio
  const inc = fp?.incognito
  const tz = fp?.timezone
  const dev = fp?.device
  const swiftshader = (g?.renderer ?? '').toLowerCase().includes('swiftshader')
  const llvmpipe = (g?.renderer ?? '').toLowerCase().includes('llvmpipe')
  const tzMismatch = tz ? !tz.consistent : false

  return (
    <section className="border-border bg-card rounded-xl border p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
          <Fingerprint className="text-primary size-3.5 shrink-0" aria-hidden />
          Fingerprint
        </h3>
        <span className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
          cached
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Pill label="navigator.webdriver" on={!!w?.webdriver} />
        <Pill label="CDP" on={!!w?.cdpPresent} />
        <Pill label="Playwright" on={!!w?.playwrightPresent} />
        <Pill
          label={`iframe ${i?.consistent ? 'consistent' : 'inconsistent'}`}
          on={i ? !i.consistent : false}
        />
        <Pill label="SwiftShader" on={swiftshader} />
        <Pill label="LLVMpipe" on={llvmpipe} />
        <Pill label="incognito" on={inc?.isIncognito === true} />
        <Pill label="tz mismatch" on={tzMismatch} />
        <Pill label="new device" on={dev?.isNew === true} />
      </div>
      <div className="border-border mt-4 space-y-1.5 border-t pt-3">
        <div className="flex items-start justify-between gap-3 text-xs">
          <span className="text-muted-foreground">WebGL renderer</span>
          <span className="text-foreground text-right font-mono">
            {g?.supported
              ? truncate(g.renderer || g.vendor || 'hidden', 38)
              : 'unsupported'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Audio hash</span>
          <span className="text-foreground font-mono">
            {a?.supported ? a.hash || '—' : 'pending'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Canvas hash</span>
          <span className="text-foreground font-mono">
            {c?.supported ? c.hash || '—' : 'unsupported'}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Plugins parent / iframe</span>
          <span className="text-foreground font-mono">
            {i?.parentPluginCount ?? 0} / {i?.iframePluginCount ?? 0}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Timezone</span>
          <span className="text-foreground font-mono">{tz?.timezone ?? '—'}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground shrink-0">Language</span>
          <span
            className={`flex items-center justify-end gap-1 font-mono ${tzMismatch ? 'text-destructive' : 'text-foreground'}`}
          >
            {tz?.language ?? '—'}
            {tzMismatch && (
              <>
                <AlertTriangle
                  className="text-destructive size-3 shrink-0"
                  aria-hidden
                />
                <span className="sr-only">Region mismatch</span>
                <span className="text-destructive max-sm:hidden">mismatch</span>
              </>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Incognito</span>
          <span
            className={`font-mono ${inc?.isIncognito === true ? 'text-destructive' : 'text-foreground'}`}
          >
            {inc?.isIncognito === null || inc?.isIncognito === undefined
              ? 'pending'
              : inc.isIncognito
                ? `yes (${inc.method})`
                : `no (${inc.method})`}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Device ID</span>
          <span
            className={`font-mono ${dev?.isNew ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'}`}
          >
            {dev
              ? `${dev.deviceId.slice(0, 8)}… ${dev.isNew ? '(new)' : '(returning)'}`
              : '—'}
          </span>
        </div>
      </div>
    </section>
  )
}
