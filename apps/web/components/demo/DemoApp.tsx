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
import { Button } from '@/components/ui/button'

export function DemoApp() {
  const { payload, sessionId, elapsedMs, submitted, formRef, submit, reset } =
    useScanner()
  const verdict = useMemo(() => computeVerdict(payload), [payload])

  return (
    <div className="bg-background flex min-h-0 flex-1 flex-col">
      <Header sessionId={sessionId} elapsedMs={elapsedMs} />

      <main className="flex flex-1 flex-col">
        <div className="container flex min-h-0 flex-1 flex-col py-8 md:py-10">
          <div className="mb-8 flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-3">
              <Button variant="ghost" size="sm" className="text-muted-foreground -ml-2.5 w-fit gap-1.5" asChild>
                <Link href="/">
                  <ArrowLeft className="size-3.5" aria-hidden />
                  Back to home
                </Link>
              </Button>
              <div>
                <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.5rem] md:tracking-[-0.04em]">
                  Live demo
                </h1>
                <p className="text-muted-foreground mt-2 text-pretty text-base leading-relaxed sm:text-lg">
                  Use the form or run a synthetic scenario. Signals and detections
                  refresh about every 250ms so you can see classification in motion.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <VerdictCard verdict={verdict} />

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <section className="border-border bg-card rounded-xl border p-5 shadow-sm">
                  <div className="mb-4">
                    <h2 className="text-foreground text-sm font-semibold">
                      Demo form
                    </h2>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                      Type, paste, scroll, or move the pointer. Submit when you are
                      done, or trigger a scenario below.
                    </p>
                  </div>
                  <DemoForm
                    ref={formRef}
                    submitted={submitted}
                    onSubmit={submit}
                    onReset={reset}
                  />
                </section>

                <section className="border-border bg-card rounded-xl border p-5 shadow-sm">
                  <ScenariosPanel formRef={formRef} disabled={submitted} />
                </section>
              </div>

              <div className="space-y-6">
                <SignalsCard signals={payload?.signals.behavioral ?? null} />
                <DetectionsCard detections={payload?.detections ?? null} />
                <FingerprintCard
                  fingerprint={payload?.signals.fingerprint ?? null}
                />
                <NetworkCard network={payload?.signals.network ?? null} />
              </div>
            </div>

            <PayloadViewer payload={payload} open={submitted} />
          </div>

          <footer className="text-muted-foreground mt-12 border-t border-border pt-8 text-center text-xs">
            <p>
              Browser SDK for behavioral and fingerprint signals.
              <span className="text-muted-foreground/80 hidden sm:inline">
                {' '}
                Docs cover integration and the full signal set.
              </span>
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}
