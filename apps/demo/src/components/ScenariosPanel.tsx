import { useState } from 'react'
import { Bot, Brain, Loader2, Play, User } from 'lucide-react'
import { runScenario } from '../scenarios'

interface ScenariosPanelProps {
  formRef: React.RefObject<HTMLFormElement>
  disabled: boolean
}

const SCENARIOS = [
  {
    id: 'human',
    label: 'Human flow',
    blurb: 'Variable typing, mouse, scroll',
    icon: User,
    accent: 'hover:border-emerald-500/40 hover:bg-emerald-500/5',
    tag: 'text-emerald-400',
  },
  {
    id: 'scripted',
    label: 'Scripted bot',
    blurb: 'Uniform 50ms keystrokes, no mouse',
    icon: Bot,
    accent: 'hover:border-amber-500/40 hover:bg-amber-500/5',
    tag: 'text-amber-400',
  },
  {
    id: 'llm',
    label: 'LLM agent',
    blurb: 'Heavy paste, no scroll, fast submit',
    icon: Brain,
    accent: 'hover:border-rose-500/40 hover:bg-rose-500/5',
    tag: 'text-rose-400',
  },
] as const

export function ScenariosPanel({ formRef, disabled }: ScenariosPanelProps): JSX.Element {
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
        <h3 className="text-sm font-semibold text-slate-200">Synthetic scenarios</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Click a scenario to see how the SDK classifies different actor types in real time.
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
              className={`group flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2.5 text-left transition-all ${s.accent} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-800/60 ring-1 ring-slate-700/40">
                {isRunning ? (
                  <Loader2 className={`size-4 animate-spin ${s.tag}`} />
                ) : (
                  <Icon className={`size-4 ${s.tag}`} strokeWidth={2} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-100">{s.label}</span>
                  {isRunning && (
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      running…
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">{s.blurb}</div>
              </div>
              {!isRunning && (
                <Play className="size-3.5 text-slate-600 transition-colors group-hover:text-slate-300" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
