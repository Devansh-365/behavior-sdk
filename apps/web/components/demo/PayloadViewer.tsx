'use client'

import { useState, useEffect, type ReactElement } from 'react'
import { ChevronDown, ChevronRight, Copy, Check, Code2 } from 'lucide-react'
import type { BehaviorPayload } from "@devanshhq/nyasa";
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PayloadViewerProps {
  payload: BehaviorPayload | null
  open: boolean
}

export function PayloadViewer({
  payload,
  open,
}: PayloadViewerProps): ReactElement | null {
  const [expanded, setExpanded] = useState<boolean>(open)
  const [copied, setCopied] = useState<boolean>(false)

  useEffect(() => {
    if (open) setExpanded(true)
  }, [open])

  if (!payload) return null
  const json = JSON.stringify(payload, null, 2)

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="hover:bg-muted/50 flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors duration-200"
      >
        <div className="flex min-w-0 items-center gap-2">
          {expanded ? (
            <ChevronDown
              className="text-muted-foreground size-4 shrink-0"
              aria-hidden
            />
          ) : (
            <ChevronRight
              className="text-muted-foreground size-4 shrink-0"
              aria-hidden
            />
          )}
          <Code2 className="text-primary size-3.5 shrink-0" aria-hidden />
          <span className="text-foreground truncate text-sm font-semibold">
            BehaviorPayload
          </span>
          <span className="text-muted-foreground font-mono text-[10px]">
            {(json.length / 1024).toFixed(1)} KB
          </span>
        </div>
        {expanded && (
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="shrink-0 gap-1.5"
            onClick={(e) => {
              e.stopPropagation()
              void copy()
            }}
          >
            {copied ? (
              <>
                <Check className="text-emerald-600 dark:text-emerald-400 size-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-3" />
                Copy
              </>
            )}
          </Button>
        )}
      </button>
      {expanded && (
        <pre
          className={cn(
            'border-border bg-code text-code-foreground max-h-[min(400px,55vh)] overflow-auto border-t px-5 py-4',
            'font-mono text-[11px] leading-relaxed wrap-break-word whitespace-pre-wrap sm:text-xs',
          )}
        >
          {json}
        </pre>
      )}
    </section>
  )
}
