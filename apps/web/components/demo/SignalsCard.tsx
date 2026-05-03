'use client'

import { Activity, HelpCircle } from 'lucide-react'
import type { BehavioralSignals } from "@devanshhq/nyasa";
import type { ReactElement } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { fmtNum, mean, variance } from '@/lib/format'

interface SignalsCardProps {
  signals: BehavioralSignals | null
  embedded?: boolean
}

function Metric({
  label,
  value,
  trail,
  highlight,
  hint,
}: {
  label: string
  value: string
  trail?: string
  highlight?: boolean
  hint?: string
}): ReactElement {
  const labelEl =
    hint != null && hint.length > 0 ? (
      <Tooltip delayDuration={300}>
        <TooltipTrigger
          type="button"
          className="text-muted-foreground inline cursor-help border-b border-dotted border-muted-foreground/35 text-left text-xs leading-snug outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {label}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[min(280px,calc(100vw-2rem))] text-left">
          {hint}
        </TooltipContent>
      </Tooltip>
    ) : (
      <span className="text-muted-foreground text-xs">{label}</span>
    )

  return (
    <div className="border-border flex items-baseline justify-between gap-2 border-b py-1.5 last:border-b-0">
      {labelEl}
      <span className="font-mono text-sm tabular-nums">
        <span
          className={
            highlight
              ? 'text-primary font-medium'
              : 'text-foreground'
          }
        >
          {value}
        </span>
        {trail && (
          <span className="text-muted-foreground ml-1 text-[10px]">{trail}</span>
        )}
      </span>
    </div>
  )
}

function GroupTitle({
  title,
  sectionHint,
}: {
  title: string
  sectionHint?: string
}): ReactElement {
  return (
    <span className="flex items-center gap-1.5">
      {title}
      {sectionHint ? (
        <Tooltip delayDuration={300}>
          <TooltipTrigger
            type="button"
            className="text-muted-foreground hover:text-foreground inline-flex shrink-0 rounded-md p-0.5 transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`About ${title}`}
          >
            <HelpCircle className="size-3.5 opacity-80" aria-hidden />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[min(280px,calc(100vw-2rem))] text-left">
            {sectionHint}
          </TooltipContent>
        </Tooltip>
      ) : null}
    </span>
  )
}

export function SignalsCard({
  signals,
  embedded = false,
}: SignalsCardProps): ReactElement {
  const k = signals?.keystroke
  const m = signals?.mouse
  const t = signals?.touch
  const cx = signals?.correction
  const p = signals?.paste
  const s = signals?.scroll
  const it = signals?.inputType
  const up = signals?.upload
  const vis = signals?.visibility
  const cl = signals?.click
  const rhy = signals?.sessionRhythm
  const ft = signals?.fieldTiming
  const dwellAvg = k ? mean(k.dwells) : 0
  const dwellVar = k ? variance(k.dwells) : 0
  const flightVar = k ? variance(k.flights) : 0
  const curvVar = m ? variance(m.curvature) : 0
  const lastScroll =
    s && s.depths.length > 0 ? (s.depths[s.depths.length - 1] ?? 0) : 0

  const accordion = (
    <Accordion
      type="multiple"
      defaultValue={['keystroke', 'pointer', 'paste']}
      className="w-full"
    >
      <AccordionItem value="keystroke" className="border-border border-b">
        <AccordionTrigger className="py-3 text-[13px] hover:no-underline">
          <GroupTitle
            title="Keystroke"
            sectionHint="Dwell and flight timing drive scripted vs human classifiers."
          />
        </AccordionTrigger>
        <AccordionContent>
          <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2 dark:bg-muted/10">
            <Metric label="Count" value={String(k?.dwells.length ?? 0)} />
            <Metric label="Avg dwell" value={fmtNum(dwellAvg, 1)} trail="ms" />
            <Metric
              label="Dwell variance"
              value={fmtNum(dwellVar, 1)}
              highlight={dwellVar > 0 && dwellVar < 2}
              hint="Very low variance often indicates scripted uniform typing."
            />
            <Metric
              label="Flight variance"
              value={fmtNum(flightVar, 1)}
              highlight={flightVar > 0 && flightVar < 5}
              hint="Time between key releases; bots often collapse variance vs humans."
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="pointer" className="border-border border-b">
        <AccordionTrigger className="py-3 text-[13px] hover:no-underline">
          <GroupTitle
            title="Pointer"
            sectionHint="Mouse path, stillness, and touch complement mobile sessions."
          />
        </AccordionTrigger>
        <AccordionContent>
          <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2 dark:bg-muted/10">
            <Metric label="Mouse points" value={String(m?.pathLength ?? 0)} />
            <Metric
              label="Curvature variance"
              value={fmtNum(curvVar, 3)}
              highlight={
                (m?.curvature.length ?? 0) >= 5 &&
                curvVar > 0 &&
                curvVar < 0.05
              }
              hint="Synthetic paths can be too straight vs human micro-wobble."
            />
            <Metric
              label="Stillness ratio"
              value={fmtNum((m?.stillnessRatio ?? 0) * 100, 0)}
              trail="%"
              highlight={
                (m?.pathLength ?? 0) > 5 && (m?.stillnessRatio ?? 0) > 0.7
              }
              hint="High stillness with typing can match LLM think-then-act bursts."
            />
            <Metric label="Touch starts" value={String(t?.touchCount ?? 0)} />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="paste" className="border-border border-b">
        <AccordionTrigger className="py-3 text-[13px] hover:no-underline">
          <GroupTitle title="Paste" sectionHint="Paste-heavy flows are common for LLM-assisted fills." />
        </AccordionTrigger>
        <AccordionContent>
          <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2 dark:bg-muted/10">
            <Metric label="Paste events" value={String(p?.pasteCount ?? 0)} />
            <Metric label="Total chars" value={String(p?.charCount ?? 0)} />
            <Metric
              label="Paste ratio"
              value={fmtNum(p?.pasteRatio ?? 0, 2)}
              highlight={(p?.pasteRatio ?? 0) > 0.8}
              hint="Chars from paste divided by total; high values flag compose-then-paste agents."
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="corrections" className="border-border border-b">
        <AccordionTrigger className="py-3 text-[13px] hover:no-underline">
          <GroupTitle
            title="Corrections and scroll"
            sectionHint="Humans typo and scroll; many bots skip both."
          />
        </AccordionTrigger>
        <AccordionContent>
          <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2 dark:bg-muted/10">
            <Metric label="Backspaces" value={String(cx?.backspaceCount ?? 0)} />
            <Metric
              label="Correction ratio"
              value={fmtNum(cx?.correctionRatio ?? 0, 3)}
              highlight={
                (p?.charCount ?? 0) > 50 && (cx?.correctionRatio ?? 0) === 0
              }
              hint="Zero corrections on long typed input is a common bot tell."
            />
            <Metric label="Scroll events" value={String(s?.depths.length ?? 0)} />
            <Metric label="Last scroll Y" value={`${lastScroll}px`} />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="inputType" className="border-border border-b">
        <AccordionTrigger className="py-3 text-[13px] hover:no-underline">
          <GroupTitle
            title="Input origin"
            sectionHint="Events from real typing vs paste vs programmatic dispatch."
          />
        </AccordionTrigger>
        <AccordionContent>
          <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2 dark:bg-muted/10">
            <Metric label="Typed" value={String(it?.typed ?? 0)} />
            <Metric label="Pasted" value={String(it?.pasted ?? 0)} />
            <Metric label="Deleted" value={String(it?.deleted ?? 0)} />
            <Metric
              label="Programmatic"
              value={String(it?.programmatic ?? 0)}
              highlight={
                (it?.programmatic ?? 0) > 5 &&
                (it?.typed ?? 0) + (it?.pasted ?? 0) + (it?.dropped ?? 0) === 0
              }
              hint="Many synthetic fills dispatch InputEvent without keyboard or paste origins."
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="visibility" className="border-border border-b">
        <AccordionTrigger className="py-3 text-[13px] hover:no-underline">
          <GroupTitle
            title="Tab visibility"
            sectionHint="Hidden tabs and blur counts — headless sessions behave differently."
          />
        </AccordionTrigger>
        <AccordionContent>
          <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2 dark:bg-muted/10">
            <Metric label="Hidden count" value={String(vis?.hiddenCount ?? 0)} />
            <Metric label="Window blurs" value={String(vis?.blurCount ?? 0)} />
            <Metric
              label="Total hidden"
              value={fmtNum((vis?.totalHiddenMs ?? 0) / 1000, 1)}
              trail="s"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="click" className="border-border border-b">
        <AccordionTrigger className="py-3 text-[13px] hover:no-underline">
          <GroupTitle
            title="Click precision"
            sectionHint="Automation often clicks the exact center of targets."
          />
        </AccordionTrigger>
        <AccordionContent>
          <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2 dark:bg-muted/10">
            <Metric label="Click count" value={String(cl?.count ?? 0)} />
            <Metric label="On interactive" value={String(cl?.targeted ?? 0)} />
            <Metric
              label="Mean offset"
              value={
                (cl?.centerOffsets.length ?? 0) >= 3
                  ? fmtNum(
                      (cl?.centerOffsets ?? []).reduce(
                        (sum, [dx, dy]) => sum + Math.sqrt(dx * dx + dy * dy),
                        0,
                      ) / (cl?.centerOffsets.length ?? 1),
                      1,
                    )
                  : '—'
              }
              trail={(cl?.centerOffsets.length ?? 0) >= 3 ? 'px' : undefined}
              highlight={
                (cl?.targeted ?? 0) >= 3 &&
                (cl?.centerOffsets.length ?? 0) >= 3 &&
                (cl?.centerOffsets ?? []).reduce(
                  (sum, [dx, dy]) => sum + Math.sqrt(dx * dx + dy * dy),
                  0,
                ) /
                  (cl?.centerOffsets.length ?? 1) <
                  3
              }
              hint="Distance from control center; humans scatter more than Playwright."
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="rhythm" className="border-border border-b">
        <AccordionTrigger className="py-3 text-[13px] hover:no-underline">
          <GroupTitle
            title="Session rhythm"
            sectionHint="Burst–pause gaps can reflect LLM inference cycles."
          />
        </AccordionTrigger>
        <AccordionContent>
          <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2 dark:bg-muted/10">
            <Metric label="Event gaps" value={String(rhy?.eventGaps.length ?? 0)} />
            <Metric label="Burst count" value={String(rhy?.burstCount ?? 0)} />
            <Metric
              label="Mean gap"
              value={fmtNum(rhy?.meanBurstGapMs ?? 0, 0)}
              trail="ms"
              highlight={(rhy?.burstCount ?? 0) > 3 && (rhy?.meanBurstGapMs ?? 0) > 800}
            />
            <Metric
              label="Gap variance"
              value={fmtNum(rhy?.gapVariance ?? 0, 0)}
              highlight={
                (rhy?.burstCount ?? 0) > 3 &&
                (rhy?.gapVariance ?? 0) < 50000 &&
                (rhy?.meanBurstGapMs ?? 0) > 800
              }
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="upload" className="border-border border-b">
        <AccordionTrigger className="py-3 text-[13px] hover:no-underline">
          <GroupTitle title="File upload" sectionHint="Picker vs programmatic attach and doc metadata." />
        </AccordionTrigger>
        <AccordionContent>
          <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2 dark:bg-muted/10">
            <Metric label="Via picker" value={String(up?.pickerCount ?? 0)} />
            <Metric label="Via drag-drop" value={String(up?.dragDropCount ?? 0)} />
            <Metric
              label="Programmatic"
              value={String(up?.programmaticCount ?? 0)}
              highlight={(up?.programmaticCount ?? 0) > 0}
              hint="Files set without user gesture often indicate automation."
            />
            <Metric label="Files attached" value={String(up?.filesAttached ?? 0)} />
            {(up?.exifResults ?? []).map((r, i) => (
              <Metric
                key={i}
                label={`File ${i + 1} (${r.fileType})`}
                value={
                  r.aiGenerated
                    ? 'AI-generated'
                    : r.metadataEmpty
                      ? 'no metadata'
                      : (r.software ?? 'ok')
                }
                highlight={
                  r.aiGenerated || (r.fileType === 'jpeg' && !r.hasExif)
                }
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="fieldTiming" className="border-border border-b last:border-b-0">
        <AccordionTrigger className="py-3 text-[13px] hover:no-underline">
          <GroupTitle
            title="Field timing"
            sectionHint="Per-field dwell; sub-100ms fills suggest batch automation."
          />
        </AccordionTrigger>
        <AccordionContent>
          <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2 dark:bg-muted/10">
            <Metric label="Fields visited" value={String(ft?.totalFields ?? 0)} />
            <Metric
              label="Instant fills"
              value={String(ft?.instantFills ?? 0)}
              trail="<100ms"
              highlight={(ft?.instantFills ?? 0) >= 2}
            />
            {Object.entries(ft?.fieldDwells ?? {})
              .slice(0, 4)
              .map(([name, dwells]) => (
                <Metric
                  key={name}
                  label={name}
                  value={String(
                    Math.round(
                      dwells.reduce((a, b) => a + b, 0) /
                        Math.max(dwells.length, 1),
                    ),
                  )}
                  trail="ms avg"
                  highlight={dwells.some((d) => d < 100)}
                />
              ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )

  const inner = (
    <>
      {!embedded && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <Activity className="text-primary size-3.5 shrink-0" aria-hidden />
            Live signals
          </h3>
          <span className="text-muted-foreground font-mono text-[10px] tracking-wide">
            ~250ms refresh
          </span>
        </div>
      )}
      {accordion}
    </>
  )

  if (embedded) {
    return (
      <div className="px-4 py-5 sm:px-5 sm:py-6">
        {inner}
      </div>
    )
  }

  return (
    <section className="border-border bg-card rounded-2xl border p-5 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] sm:p-6">
      {inner}
    </section>
  )
}
