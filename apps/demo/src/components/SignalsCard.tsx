import { Activity } from 'lucide-react'
import type { BehavioralSignals } from 'behavior-sdk'
import { fmtNum, mean, variance } from '../lib/format'

interface SignalsCardProps {
  signals: BehavioralSignals | null
}

interface MetricProps {
  label: string
  value: string
  trail?: string
  highlight?: boolean
}

function Metric({ label, value, trail, highlight }: MetricProps): JSX.Element {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-slate-800/60 py-1.5 last:border-b-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="font-mono text-sm tabular-nums">
        <span className={highlight ? 'text-cyan-300' : 'text-slate-200'}>{value}</span>
        {trail && <span className="ml-1 text-[10px] text-slate-500">{trail}</span>}
      </span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </div>
      {children}
    </div>
  )
}

export function SignalsCard({ signals }: SignalsCardProps): JSX.Element {
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
  const lastScroll = s && s.depths.length > 0 ? s.depths[s.depths.length - 1] ?? 0 : 0

  return (
    <section className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Activity className="size-3.5 text-cyan-400" />
          Live signals
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
          250ms refresh
        </span>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <Section title="Keystroke">
          <Metric label="Count" value={String(k?.dwells.length ?? 0)} />
          <Metric label="Avg dwell" value={fmtNum(dwellAvg, 1)} trail="ms" />
          <Metric label="Dwell variance" value={fmtNum(dwellVar, 1)} highlight={dwellVar > 0 && dwellVar < 2} />
          <Metric label="Flight variance" value={fmtNum(flightVar, 1)} highlight={flightVar > 0 && flightVar < 5} />
        </Section>

        <Section title="Pointer">
          <Metric label="Mouse points" value={String(m?.pathLength ?? 0)} />
          <Metric
            label="Curvature variance"
            value={fmtNum(curvVar, 3)}
            highlight={(m?.curvature.length ?? 0) >= 5 && curvVar > 0 && curvVar < 0.05}
          />
          <Metric
            label="Stillness ratio"
            value={fmtNum((m?.stillnessRatio ?? 0) * 100, 0)}
            trail="%"
            highlight={(m?.pathLength ?? 0) > 5 && (m?.stillnessRatio ?? 0) > 0.7}
          />
          <Metric label="Touch starts" value={String(t?.touchCount ?? 0)} />
        </Section>

        <Section title="Paste">
          <Metric label="Paste events" value={String(p?.pasteCount ?? 0)} />
          <Metric label="Total chars" value={String(p?.charCount ?? 0)} />
          <Metric
            label="Paste ratio"
            value={fmtNum(p?.pasteRatio ?? 0, 2)}
            highlight={(p?.pasteRatio ?? 0) > 0.8}
          />
        </Section>

        <Section title="Corrections / Scroll">
          <Metric label="Backspaces" value={String(cx?.backspaceCount ?? 0)} />
          <Metric
            label="Correction ratio"
            value={fmtNum(cx?.correctionRatio ?? 0, 3)}
            highlight={(p?.charCount ?? 0) > 50 && (cx?.correctionRatio ?? 0) === 0}
          />
          <Metric label="Scroll events" value={String(s?.depths.length ?? 0)} />
          <Metric label="Last scroll Y" value={`${lastScroll}px`} />
        </Section>

        <Section title="Input origin">
          <Metric label="Typed" value={String(it?.typed ?? 0)} />
          <Metric label="Pasted" value={String(it?.pasted ?? 0)} />
          <Metric label="Deleted" value={String(it?.deleted ?? 0)} />
          <Metric
            label="Programmatic"
            value={String(it?.programmatic ?? 0)}
            highlight={(it?.programmatic ?? 0) > 5 && (it?.typed ?? 0) + (it?.pasted ?? 0) + (it?.dropped ?? 0) === 0}
          />
        </Section>

        <Section title="Tab visibility">
          <Metric label="Hidden count" value={String(vis?.hiddenCount ?? 0)} />
          <Metric label="Window blurs" value={String(vis?.blurCount ?? 0)} />
          <Metric label="Total hidden" value={fmtNum((vis?.totalHiddenMs ?? 0) / 1000, 1)} trail="s" />
        </Section>

        <Section title="Click precision">
          <Metric label="Click count" value={String(cl?.count ?? 0)} />
          <Metric label="On interactive" value={String(cl?.targeted ?? 0)} />
          <Metric
            label="Mean offset"
            value={
              (cl?.centerOffsets.length ?? 0) >= 3
                ? fmtNum(
                    (cl?.centerOffsets ?? []).reduce((s, [dx, dy]) => s + Math.sqrt(dx * dx + dy * dy), 0) /
                      (cl?.centerOffsets.length ?? 1),
                    1,
                  )
                : '—'
            }
            trail={(cl?.centerOffsets.length ?? 0) >= 3 ? 'px' : undefined}
            highlight={
              (cl?.targeted ?? 0) >= 3 &&
              (cl?.centerOffsets.length ?? 0) >= 3 &&
              (cl?.centerOffsets ?? []).reduce((s, [dx, dy]) => s + Math.sqrt(dx * dx + dy * dy), 0) /
                (cl?.centerOffsets.length ?? 1) < 3
            }
          />
        </Section>

        <Section title="Session rhythm">
          <Metric label="Event gaps" value={String(rhy?.eventGaps.length ?? 0)} />
          <Metric label="Burst count" value={String(rhy?.burstCount ?? 0)} />
          <Metric label="Mean gap" value={fmtNum(rhy?.meanBurstGapMs ?? 0, 0)} trail="ms"
            highlight={(rhy?.burstCount ?? 0) > 3 && (rhy?.meanBurstGapMs ?? 0) > 800}
          />
          <Metric label="Gap variance" value={fmtNum(rhy?.gapVariance ?? 0, 0)}
            highlight={(rhy?.burstCount ?? 0) > 3 && (rhy?.gapVariance ?? 0) < 50000 && (rhy?.meanBurstGapMs ?? 0) > 800}
          />
        </Section>

        <Section title="File upload">
          <Metric label="Via picker" value={String(up?.pickerCount ?? 0)} />
          <Metric label="Via drag-drop" value={String(up?.dragDropCount ?? 0)} />
          <Metric
            label="Programmatic"
            value={String(up?.programmaticCount ?? 0)}
            highlight={(up?.programmaticCount ?? 0) > 0}
          />
          <Metric label="Files attached" value={String(up?.filesAttached ?? 0)} />
          {(up?.exifResults ?? []).map((r, i) => (
            <Metric
              key={i}
              label={`File ${i + 1} (${r.fileType})`}
              value={r.aiGenerated ? 'AI-generated' : r.metadataEmpty ? 'no metadata' : r.software ?? 'ok'}
              highlight={r.aiGenerated || (r.fileType === 'jpeg' && !r.hasExif)}
            />
          ))}
        </Section>

        <Section title="Field timing">
          <Metric label="Fields visited" value={String(ft?.totalFields ?? 0)} />
          <Metric
            label="Instant fills"
            value={String(ft?.instantFills ?? 0)}
            trail="<100ms"
            highlight={(ft?.instantFills ?? 0) >= 2}
          />
          {Object.entries(ft?.fieldDwells ?? {}).slice(0, 4).map(([name, dwells]) => (
            <Metric
              key={name}
              label={name}
              value={String(Math.round((dwells.reduce((a, b) => a + b, 0) / Math.max(dwells.length, 1))))}
              trail="ms avg"
              highlight={dwells.some(d => d < 100)}
            />
          ))}
        </Section>
      </div>
    </section>
  )
}
