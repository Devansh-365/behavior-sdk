'use client'

import type { ReactElement } from 'react'
import { Activity } from 'lucide-react'
import { fmtElapsed } from '@/lib/format'
import { cn } from '@/lib/utils'

interface HeaderProps {
  sessionId: string
  elapsedMs: number
}

/** Slim bar below the global nav: session timing only (page title lives in DemoApp). */
export function Header({ sessionId, elapsedMs }: HeaderProps): ReactElement {
  return (
    <header
      className={cn(
        'border-b border-border/80 bg-muted/15',
        'supports-backdrop-filter:bg-background/60 supports-backdrop-filter:backdrop-blur-sm',
      )}
    >
      <div className="container flex items-center justify-between gap-4 px-4 py-2 sm:px-6 sm:py-2.5 lg:px-8">
        <div className="text-muted-foreground flex min-w-0 items-center gap-2 text-xs font-medium tracking-wide">
          <Activity
            className="text-muted-foreground/80 size-3.5 shrink-0"
            strokeWidth={2}
            aria-hidden
          />
          <span className="uppercase">Session</span>
        </div>
        <div className="text-muted-foreground flex shrink-0 items-center gap-3 font-mono text-[11px] sm:text-xs">
          <span className="truncate">
            <span className="text-muted-foreground/90 max-sm:hidden">id </span>
            <span className="text-foreground">{sessionId.slice(0, 8)}</span>
          </span>
          <span className="text-foreground tabular-nums">
            {fmtElapsed(elapsedMs)}
          </span>
        </div>
      </div>
    </header>
  )
}
