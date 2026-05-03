'use client'

import type { ReactElement } from 'react'
import { Wifi, Zap, Clock } from 'lucide-react'
import type { NetworkSignals } from "@devanshhq/nyasa";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface NetworkCardProps {
  network: NetworkSignals | null
  embedded?: boolean
}

function fmtMs(n: number | null): string {
  return n === null ? '—' : `${n.toFixed(0)} ms`
}
function fmt(n: number | null, suffix = ''): string {
  return n === null ? '—' : `${n}${suffix}`
}

export function NetworkCard({
  network,
  embedded = false,
}: NetworkCardProps): ReactElement {
  const reaction = network?.reaction
  const conn = network?.connection
  const timing = network?.timing
  const fid = reaction?.firstInputDelay ?? null
  const min = reaction?.minInputDelay ?? null
  const engagement = reaction?.engagementDelayMs ?? null
  const subhuman = min !== null && min < 50
  const botEngagement = engagement !== null && engagement < 200

  const inner = (
    <>
      {!embedded && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <Wifi className="text-primary size-3.5 shrink-0" aria-hidden />
            Network
          </h3>
          <span className="text-muted-foreground font-mono text-[10px] tracking-wide">
            timing
          </span>
        </div>
      )}
      <div
        className={`rounded-lg border p-3 transition-colors duration-200 ${
          subhuman
            ? 'border-destructive/35 bg-destructive/5 dark:border-destructive/40'
            : 'border-border bg-muted/30'
        }`}
      >
        <div className="mb-1 flex items-center gap-2">
          <Zap
            className={`size-3.5 shrink-0 ${subhuman ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'}`}
            aria-hidden
          />
          <span className="text-foreground text-xs font-medium">Reaction time</span>
          <span className="text-muted-foreground ml-auto text-[10px]">
            focus to first input
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`font-mono text-2xl tabular-nums ${subhuman ? 'text-destructive' : 'text-foreground'}`}
          >
            {fid === null ? '—' : `${fid.toFixed(0)}`}
          </span>
          <span className="text-muted-foreground text-xs">ms first input</span>
        </div>
        <div className="text-muted-foreground mt-1 flex items-center justify-between text-[11px]">
          <span>min observed: {fmtMs(min)}</span>
          {subhuman && (
            <span className="text-destructive font-mono">&lt; 50ms, non-human</span>
          )}
        </div>
        <div
          className={`mt-2 flex items-center justify-between rounded-md px-2 py-1 text-[11px] ${
            botEngagement ? 'bg-destructive/10' : 'bg-muted/50'
          }`}
        >
          <span className="text-muted-foreground">Engagement delay</span>
          <span
            className={`font-mono ${botEngagement ? 'text-destructive' : 'text-foreground'}`}
          >
            {engagement === null ? 'no focus yet' : `${engagement.toFixed(0)} ms`}
            {botEngagement && ' · bot-speed'}
          </span>
        </div>
      </div>
      <Accordion
        type="multiple"
        defaultValue={['connection']}
        className="mt-4 w-full"
      >
        <AccordionItem value="connection" className="border-border border-t">
          <AccordionTrigger className="py-3 text-[13px] hover:no-underline">
            Browser connection
          </AccordionTrigger>
          <AccordionContent>
            <div className="border-border space-y-1.5 rounded-lg border bg-muted/15 px-3 py-2.5 dark:bg-muted/10">
        <div className="text-muted-foreground mb-1 text-[11px] font-medium">
          Network Information API
        </div>
        {conn?.supported ? (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Effective type</span>
              <span className="text-foreground font-mono">
                {conn.effectiveType ?? '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">RTT (browser)</span>
              <span className="text-foreground font-mono">{fmtMs(conn.rtt)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Downlink</span>
              <span className="text-foreground font-mono">
                {fmt(conn.downlink, ' Mbps')}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Save-data mode</span>
              <span className="text-foreground font-mono">
                {conn.saveData === null
                  ? '—'
                  : conn.saveData
                    ? 'on'
                    : 'off'}
              </span>
            </div>
          </>
        ) : (
          <div className="text-muted-foreground text-xs italic">
            navigator.connection unsupported (Firefox / Safari)
          </div>
        )}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="timing" className="border-border border-t">
          <AccordionTrigger className="py-3 text-[13px] hover:no-underline">
            <span className="flex items-center gap-2">
              <Clock className="size-3.5 opacity-80" aria-hidden />
              Page load timing
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="border-border space-y-1.5 rounded-lg border bg-muted/15 px-3 py-2.5 dark:bg-muted/10">
        {timing?.supported ? (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">DNS lookup</span>
              <span className="text-foreground font-mono">{fmtMs(timing.dnsMs)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">TCP connect</span>
              <span className="text-foreground font-mono">{fmtMs(timing.tcpMs)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">TLS handshake</span>
              <span className="text-foreground font-mono">{fmtMs(timing.tlsMs)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Time to first byte</span>
              <span className="text-foreground font-mono">{fmtMs(timing.ttfbMs)}</span>
            </div>
          </>
        ) : (
          <div className="text-muted-foreground text-xs italic">
            Navigation Timing entry unavailable
          </div>
        )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )

  if (embedded) {
    return (
      <div className="border-border border-t px-4 py-5 sm:px-5 sm:py-6">
        {inner}
      </div>
    )
  }

  return (
    <section className="border-border bg-card rounded-2xl border p-5 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] sm:p-6">
      {inner}
    </section>
  )
}
