'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Copy, Check, Code2 } from 'lucide-react'
import type { BehaviorPayload } from 'behavior-sdk'

interface PayloadViewerProps {
  payload: BehaviorPayload | null
  open: boolean
}

export function PayloadViewer({ payload, open }: PayloadViewerProps): JSX.Element | null {
  const [expanded, setExpanded] = useState<boolean>(open)
  const [copied, setCopied] = useState<boolean>(false)

  if (!payload) return null
  const json = JSON.stringify(payload, null, 2)

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }

  return (
    <section className="rounded-xl border border-slate-800/80 bg-slate-900/40">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-5 py-3.5 text-left transition-colors hover:bg-slate-900/60"
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="size-4 text-slate-500" /> : <ChevronRight className="size-4 text-slate-500" />}
          <Code2 className="size-3.5 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-200">BehaviorPayload</span>
          <span className="font-mono text-[10px] text-slate-500">{(json.length / 1024).toFixed(1)} KB</span>
        </div>
        {expanded && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); void copy() }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); void copy() } }}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/60 px-2 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-800/60"
          >
            {copied ? <><Check className="size-3 text-emerald-400" />copied</> : <><Copy className="size-3" />copy</>}
          </span>
        )}
      </button>
      {expanded && (
        <pre className="payload-pre max-h-[400px] overflow-auto border-t border-slate-800/60 px-5 py-4 text-slate-300">{json}</pre>
      )}
    </section>
  )
}
