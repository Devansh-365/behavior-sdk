'use client'

import { Activity } from 'lucide-react'
import { fmtElapsed } from '@/lib/format'

interface HeaderProps {
  sessionId: string
  elapsedMs: number
}

export function Header({ sessionId, elapsedMs }: HeaderProps): JSX.Element {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-cyan-400/5 ring-1 ring-cyan-400/30">
            <Activity className="size-4 text-cyan-400" strokeWidth={2.5} />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-sm font-semibold tracking-tight text-slate-100">
              behavior-sdk
            </span>
            <span className="text-xs text-slate-500">live demo</span>
          </div>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs text-slate-400">
          <span>session: <span className="text-slate-300">{sessionId.slice(0, 8)}</span></span>
          <span className="hidden sm:inline">elapsed: <span className="text-slate-300">{fmtElapsed(elapsedMs)}</span></span>
        </div>
      </div>
    </header>
  )
}
