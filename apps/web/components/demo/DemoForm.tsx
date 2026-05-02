'use client'

import { forwardRef, type ReactNode } from 'react'
import { CheckCircle2, RotateCcw, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface DemoFormProps {
  submitted: boolean
  onSubmit: () => void
  onReset: () => void
}

function Label({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string
  children: ReactNode
  hint?: ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-foreground mb-1.5 block text-sm font-medium"
    >
      {children}
      {hint != null && (
        <span className="text-muted-foreground ml-1 font-normal">{hint}</span>
      )}
    </label>
  )
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
          <Label htmlFor="field-name">Full name</Label>
          <Input
            id="field-name"
            name="name"
            type="text"
            placeholder="e.g. Ada Lovelace"
            disabled={submitted}
            className="h-10 md:h-9"
          />
        </div>
        <div>
          <Label htmlFor="field-email">Email</Label>
          <Input
            id="field-email"
            name="email"
            type="email"
            placeholder="ada@example.com"
            disabled={submitted}
            className="h-10 md:h-9"
          />
        </div>
        <div>
          <Label htmlFor="field-message">Tell us why</Label>
          <Textarea
            id="field-message"
            name="message"
            rows={5}
            placeholder="A few sentences…"
            disabled={submitted}
            className="min-h-[120px] resize-y"
          />
        </div>
        <div>
          <Label htmlFor="field-doc" hint={<span>(optional)</span>}>
            Supporting document
          </Label>
          <Input
            id="field-doc"
            name="doc"
            type="file"
            accept=".pdf,.png,.jpg"
            disabled={submitted}
            className={cn(
              'h-auto cursor-pointer py-2',
              'file:bg-secondary file:text-secondary-foreground file:mr-3 file:rounded-md file:px-2.5 file:py-1 file:text-xs file:font-medium',
            )}
          />
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="submit"
            disabled={submitted}
            className="min-h-10 flex-1 gap-2 sm:min-h-9"
          >
            {submitted ? (
              <>
                <CheckCircle2 className="size-4" aria-hidden />
                Session analyzed
              </>
            ) : (
              <>
                <Send className="size-4" aria-hidden />
                Analyze session
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="min-h-10 gap-2 sm:min-h-9"
          >
            <RotateCcw className="size-4" aria-hidden />
            Reset
          </Button>
        </div>
      </form>
    )
  },
)
