'use client'

import { Wifi, Zap, Clock } from 'lucide-react'
import type { NetworkSignals } from 'behavior-sdk'

interface NetworkCardProps {
  network: NetworkSignals | null
}

function fmtMs(n: number | null): string { return n === null ? '—' : `${n.toFixed(0)} ms` }
function fmt(n: number | null, suffix = ''): string { return n === null ? '—' : `${n}${suffix}` }

export function NetworkCard({ network }: NetworkCardProps): JSX.Element {
  const reaction = network?.reaction
  const conn = network?.connection
  const timing = network?.timing
  const fid = reaction?.firstInputDelay ?? null
  const min = reaction?.minInputDelay ?? null
  const engagement = reaction?.engagementDelayMs ?? null
  const subhuman = min !== null && min < 50
  const botEngagement = engagement !== null && engagement < 200

  return (
    <section className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Wifi className="size-3.5 text-cyan-400" />
          Network
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">timing pillar</span>
      </div>
      <div className={`rounded-lg border p-3 transition-colors ${subhuman ? 'border-rose-500/40 bg-rose-500/5' : 'border-slate-800/60 bg-slate-900/30'}`}>
        <div className="mb-1 flex items-center gap-2">
          <Zap className={`size-3.5 ${subhuman ? 'text-rose-400' : 'text-amber-400'}`} />
          <span className="text-xs font-medium text-slate-300">Reaction time</span>
          <span className="ml-auto text-[10px] text-slate-500">focus → first input</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`font-mono text-2xl tabular-nums ${subhuman ? 'text-rose-400' : 'text-slate-100'}`}>
            {fid === null ? '—' : `${fid.toFixed(0)}`}
          </span>
          <span className="text-xs text-slate-500">ms first input</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">min observed: {fmtMs(min)}</span>
          {subhuman && <span className="font-mono text-rose-400">{'< 50ms — non-human'}</span>}
        </div>
        <div className={`mt-2 flex items-center justify-between rounded px-2 py-1 text-[11px] ${botEngagement ? 'bg-rose-500/10' : 'bg-slate-800/40'}`}>
          <span className="text-slate-400">Engagement delay</span>
          <span className={`font-mono ${botEngagement ? 'text-rose-400' : 'text-slate-300'}`}>
            {engagement === null ? 'no focus yet' : `${engagement.toFixed(0)} ms`}
            {botEngagement && ' — bot-speed'}
          </span>
        </div>
      </div>
      <div className="mt-4 space-y-1.5 border-t border-slate-800/60 pt-3">
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Connection</div>
        {conn?.supported ? (
          <>
            <div className="flex items-center justify-between text-xs"><span className="text-slate-400">Effective type</span><span className="font-mono text-slate-200">{conn.effectiveType ?? '—'}</span></div>
            <div className="flex items-center justify-between text-xs"><span className="text-slate-400">RTT (browser)</span><span className="font-mono text-slate-200">{fmtMs(conn.rtt)}</span></div>
            <div className="flex items-center justify-between text-xs"><span className="text-slate-400">Downlink</span><span className="font-mono text-slate-200">{fmt(conn.downlink, ' Mbps')}</span></div>
            <div className="flex items-center justify-between text-xs"><span className="text-slate-400">Save-data mode</span><span className="font-mono text-slate-200">{conn.saveData === null ? '—' : conn.saveData ? 'on' : 'off'}</span></div>
          </>
        ) : (
          <div className="text-xs text-slate-500 italic">navigator.connection unsupported (Firefox / Safari)</div>
        )}
      </div>
      <div className="mt-4 space-y-1.5 border-t border-slate-800/60 pt-3">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          <Clock className="size-3" />
          Page load
        </div>
        {timing?.supported ? (
          <>
            <div className="flex items-center justify-between text-xs"><span className="text-slate-400">DNS lookup</span><span className="font-mono text-slate-200">{fmtMs(timing.dnsMs)}</span></div>
            <div className="flex items-center justify-between text-xs"><span className="text-slate-400">TCP connect</span><span className="font-mono text-slate-200">{fmtMs(timing.tcpMs)}</span></div>
            <div className="flex items-center justify-between text-xs"><span className="text-slate-400">TLS handshake</span><span className="font-mono text-slate-200">{fmtMs(timing.tlsMs)}</span></div>
            <div className="flex items-center justify-between text-xs"><span className="text-slate-400">Time to first byte</span><span className="font-mono text-slate-200">{fmtMs(timing.ttfbMs)}</span></div>
          </>
        ) : (
          <div className="text-xs text-slate-500 italic">Navigation Timing entry unavailable</div>
        )}
      </div>
    </section>
  )
}
