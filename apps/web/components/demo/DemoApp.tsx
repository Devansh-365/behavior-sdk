'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Header } from './Header'
import { VerdictCard } from './VerdictCard'
import { DemoForm } from './DemoForm'
import { ScenariosPanel } from './ScenariosPanel'
import { DemoTelemetryPanel } from './DemoTelemetryPanel'
import { DetectionsCard } from './DetectionsCard'
import { PayloadViewer } from './PayloadViewer'
import { computeVerdict } from '@/lib/verdict'
import { useScanner } from '@/lib/useScanner'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function DemoApp() {
  const { payload, sessionId, elapsedMs, submitted, formRef, submit, reset } =
    useScanner()
  const verdict = useMemo(() => computeVerdict(payload), [payload])

  return (
      <div className="bg-background flex min-h-0 flex-1 flex-col">
        <Header sessionId={sessionId} elapsedMs={elapsedMs} />

        <main className="flex flex-1 flex-col">
          <div className="container flex min-h-0 flex-1 flex-col px-4 py-8 sm:px-6 md:py-10 lg:px-8">
            <div className="mb-8 flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground -ml-2.5 w-fit gap-1.5"
                  asChild
                >
                  <Link href="/">
                    <ArrowLeft className="size-3.5" aria-hidden />
                    Back to home
                  </Link>
                </Button>
                <div>
                  <p className="text-muted-foreground mb-1 text-[11px] font-medium tracking-wide">
                    Nyasa SDK · Interactive lab
                  </p>
                  <h1 className="text-foreground font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
                    Live demo
                  </h1>
                  <p className="text-muted-foreground mt-2 max-w-[65ch] text-pretty text-sm leading-relaxed sm:text-[15px]">
                    Use the form or run a synthetic scenario. Signals and
                    detections update on a short interval so you can watch the
                    session classification drift in real time.
                  </p>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger
                  type="button"
                  className="text-muted-foreground hover:text-foreground hidden max-w-xs text-left text-xs leading-snug underline decoration-dotted decoration-muted-foreground/50 underline-offset-4 transition-colors sm:block"
                >
                  What is this page?
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  className="max-w-[min(320px,calc(100vw-2rem))] text-left"
                >
                  Client-side signals only. The verdict is a pre-classification
                  for UX feedback; your backend still makes the production
                  decision.
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="space-y-6 lg:space-y-8">
              <VerdictCard verdict={verdict} />

              <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
                <div className="space-y-6 lg:col-span-5">
                  <div className="divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]">
                    <div className="p-5 sm:p-6">
                      <h2 className="text-foreground text-sm font-semibold">
                        Session form
                      </h2>
                      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                        Type, paste, scroll, or move the pointer. Submit when
                        finished, or run a scenario below.
                      </p>
                      <div className="mt-5">
                        <DemoForm
                          ref={formRef}
                          submitted={submitted}
                          onSubmit={submit}
                          onReset={reset}
                        />
                      </div>
                    </div>
                    <div className="border-border border-t p-5 sm:p-6">
                      <ScenariosPanel formRef={formRef} disabled={submitted} />
                    </div>
                  </div>
                </div>

                <div className="space-y-5 lg:col-span-7 lg:sticky lg:top-[4.5rem] lg:self-start">
                  <DetectionsCard detections={payload?.detections ?? null} />
                  <DemoTelemetryPanel
                    behavioral={payload?.signals.behavioral ?? null}
                    fingerprint={payload?.signals.fingerprint ?? null}
                    network={payload?.signals.network ?? null}
                  />
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
