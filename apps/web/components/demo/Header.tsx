'use client'

import type { ReactElement } from 'react'
import { BrandMark } from '@/components/brand-mark'
import { fmtElapsed } from '@/lib/format'
import { cn } from '@/lib/utils'

interface HeaderProps {
  sessionId: string
  elapsedMs: number
}

export function Header({ sessionId, elapsedMs }: HeaderProps): ReactElement {
  return (
    <header
      className={cn(
        'border-b border-border bg-muted/30 backdrop-blur-sm transition-colors',
        'supports-backdrop-filter:bg-muted/20',
      )}
    >
      <div className="container flex items-center justify-between gap-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-primary/10 text-primary ring-border flex size-8 shrink-0 items-center justify-center rounded-lg ring-1">
            <BrandMark className="size-[1.35rem]" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-foreground font-mono text-sm font-semibold tracking-tight">
                Live demo
              </span>
              <span className="text-muted-foreground text-xs font-normal">
                behavior-sdk
              </span>
            </div>
          </div>
        </div>
        <div className="text-muted-foreground flex shrink-0 items-center gap-3 font-mono text-xs">
          <span className="truncate">
            session{' '}
            <span className="text-foreground">{sessionId.slice(0, 8)}</span>
          </span>
          <span className="text-foreground hidden sm:inline tabular-nums">
            {fmtElapsed(elapsedMs)}
          </span>
        </div>
      </div>
    </header>
  )
}
