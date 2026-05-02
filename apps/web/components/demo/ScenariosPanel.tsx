'use client'

import { useState, type ReactElement } from 'react'
import { Bot, Brain, Loader2, Play, User, Ghost } from 'lucide-react'
import { runScenario } from '@/scenarios'

interface ScenariosPanelProps {
  formRef: React.RefObject<HTMLFormElement | null>
  disabled: boolean
}

const SCENARIOS = [
  {
    id: 'human',
    label: 'Human flow',
    blurb: 'Variable typing, mouse, scroll',
    icon: User,
    accent:
      'hover:border-emerald-500/35 hover:bg-emerald-500/5 dark:hover:border-emerald-500/40',
    tag: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'scripted',
    label: 'Scripted bot',
    blurb: 'Uniform 50ms keystrokes, no mouse',
    icon: Bot,
    accent:
      'hover:border-amber-500/35 hover:bg-amber-500/5 dark:hover:border-amber-500/40',
    tag: 'text-amber-700 dark:text-amber-400',
  },
  {
    id: 'llm',
    label: 'LLM agent',
    blurb: 'Heavy paste, no scroll, fast submit',
    icon: Brain,
    accent:
      'hover:border-rose-500/35 hover:bg-rose-500/5 dark:hover:border-rose-500/40',
    tag: 'text-rose-700 dark:text-rose-400',
  },
  {
    id: 'stealth',
    label: 'Stealth bot',
    blurb: 'dispatchEvent + programmatic file attach',
    icon: Ghost,
    accent:
      'hover:border-violet-500/35 hover:bg-violet-500/5 dark:hover:border-violet-500/40',
    tag: 'text-violet-700 dark:text-violet-400',
  },
] as const

export function ScenariosPanel({
  formRef,
  disabled,
}: ScenariosPanelProps): ReactElement {
  const [running, setRunning] = useState<string | null>(null)

  async function dispatch(id: string): Promise<void> {
    if (running || disabled) return
    const form = formRef.current
    if (!form) return
    setRunning(id)
    try {
      await runScenario(id, form)
    } finally {
      setRunning(null)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-foreground text-sm font-semibold">
          Synthetic scenarios
        </h3>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          Run a scenario to see how different actor types change signals and
          detections in real time.
        </p>
      </div>
      <div className="grid gap-2">
        {SCENARIOS.map((s) => {
          const Icon = s.icon
          const isRunning = running === s.id
          return (
            <button
              key={s.id}
              type="button"
              disabled={disabled || running !== null}
              onClick={() => dispatch(s.id)}
              className={`border-border bg-card/50 group flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors duration-200 ${s.accent} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <div className="bg-muted ring-border flex size-9 shrink-0 items-center justify-center rounded-lg ring-1">
                {isRunning ? (
                  <Loader2 className={`size-4 animate-spin ${s.tag}`} />
                ) : (
                  <Icon className={`size-4 ${s.tag}`} strokeWidth={2} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-sm font-medium">
                    {s.label}
                  </span>
                  {isRunning && (
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                      running…
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground text-xs">{s.blurb}</div>
              </div>
              {!isRunning && (
                <Play className="text-muted-foreground group-hover:text-foreground size-3.5 transition-colors" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
