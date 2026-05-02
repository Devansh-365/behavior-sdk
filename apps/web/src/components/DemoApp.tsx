'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Header } from './Header'
import { VerdictCard } from './VerdictCard'
import { DemoForm } from './DemoForm'
import { ScenariosPanel } from './ScenariosPanel'
import { SignalsCard } from './SignalsCard'
import { DetectionsCard } from './DetectionsCard'
import { FingerprintCard } from './FingerprintCard'
import { NetworkCard } from './NetworkCard'
import { PayloadViewer } from './PayloadViewer'
import { computeVerdict } from '@/lib/verdict'
import { useScanner } from '@/lib/useScanner'

export function DemoApp() {
  const { payload, sessionId, elapsedMs, submitted, formRef, submit, reset } = useScanner()
  const verdict = useMemo(() => computeVerdict(payload), [payload])

  return (
    <div className="min-h-dvh">
      <Header sessionId={sessionId} elapsedMs={elapsedMs} />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-300"
          >
            <ArrowLeft className="size-3" />
            Home
          </Link>
        </div>

        <div className="space-y-6">
          <VerdictCard verdict={verdict} />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <section className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-slate-200">Demo form</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Type, paste, scroll, or move your mouse. Hit submit when you're done — or run a synthetic scenario below.
                  </p>
                </div>
                <DemoForm ref={formRef} submitted={submitted} onSubmit={submit} onReset={reset} />
              </section>

              <section className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
                <ScenariosPanel formRef={formRef} disabled={submitted} />
              </section>
            </div>

            <div className="space-y-6">
              <SignalsCard signals={payload?.signals.behavioral ?? null} />
              <DetectionsCard detections={payload?.detections ?? null} />
              <FingerprintCard fingerprint={payload?.signals.fingerprint ?? null} />
              <NetworkCard network={payload?.signals.network ?? null} />
            </div>
          </div>

          <PayloadViewer payload={payload} open={submitted} />
        </div>

        <footer className="mt-12 border-t border-slate-800/60 pt-6 text-center text-xs text-slate-500">
          <span className="font-mono">behavior-sdk</span> · TypeScript browser SDK ·{' '}
          <span className="text-slate-600">Real-time signal collection + actor classification</span>
        </footer>
      </main>
    </div>
  )
}
