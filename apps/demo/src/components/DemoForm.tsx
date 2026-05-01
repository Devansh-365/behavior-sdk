import { forwardRef } from 'react'
import { CheckCircle2, RotateCcw, Send } from 'lucide-react'

interface DemoFormProps {
  submitted: boolean
  onSubmit: () => void
  onReset: () => void
}

export const DemoForm = forwardRef<HTMLFormElement, DemoFormProps>(
  function DemoForm({ submitted, onSubmit, onReset }, ref) {
    return (
      <form
        ref={ref}
        autoComplete="off"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          if (!submitted) onSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <div>
          <label htmlFor="field-name" className="mb-1 block text-xs font-medium text-slate-400">
            Full name
          </label>
          <input
            id="field-name"
            name="name"
            type="text"
            placeholder="e.g. Ada Lovelace"
            disabled={submitted}
            className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 disabled:opacity-60"
          />
        </div>
        <div>
          <label htmlFor="field-email" className="mb-1 block text-xs font-medium text-slate-400">
            Email
          </label>
          <input
            id="field-email"
            name="email"
            type="email"
            placeholder="ada@example.com"
            disabled={submitted}
            className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 disabled:opacity-60"
          />
        </div>
        <div>
          <label htmlFor="field-message" className="mb-1 block text-xs font-medium text-slate-400">
            Tell us why
          </label>
          <textarea
            id="field-message"
            name="message"
            rows={5}
            placeholder="A few sentences…"
            disabled={submitted}
            className="w-full resize-y rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 disabled:opacity-60"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="submit"
            disabled={submitted}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {submitted ? (
              <>
                <CheckCircle2 className="size-4" />
                Session analyzed
              </>
            ) : (
              <>
                <Send className="size-4" />
                Analyze session
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800/50"
          >
            <RotateCcw className="size-4" />
            Reset
          </button>
        </div>
      </form>
    )
  }
)
