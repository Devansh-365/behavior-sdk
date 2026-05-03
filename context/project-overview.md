# Project Overview

## What this system does

A browser-side SDK (`@devanshhq/nyasa`) that embeds into **customer web pages** (not “forms-only”): **`collect()`** accepts a **CSS selector or `HTMLElement`**, which becomes the **mount** for session-scoped behavior. It captures **behavioral**, **fingerprint**, and **network** signals, runs **client-side detection rules** and a **derived verdict**, and sends a JSON payload (e.g. **`sendBeacon`**) to the Zoven scoring API. The API remains authoritative for final **actor classification** and **risk score**; the SDK supplies rich signals and a **preview verdict** for UX and debugging.

## Integration surface (mount element, not just `<form>`)

- **`collect('#id' | element, { endpoint, sessionId })`** — The root is often a `<form>` or a **section that wraps inputs** (wizard step, modal, chat composer, canvas app shell). Many behavioral collectors **listen on or under** that mount (keystroke, paste, field timing, file inputs, etc.).
- **Page-wide signals** still run: **mouse / touch / click** attach to **`document`** where the implementation needs global pointer context; **fingerprint** and **navigation timing** are **environment / page** level; **scroll** and **tab visibility** are not limited to the mount subtree.
- **Default flush triggers:** submit on **`element.closest('form') ?? element`** (if there is no `<form>` ancestor, **automatic submit flush won’t fire** — call **`handle.flush()`** yourself, e.g. SPA route change, wizard **Next**, or custom save).
- **Always available:** **`visibilitychange` → `hidden`** still triggers flush (tab close / background), and **`stop()`** / **`flush()`** behave the same regardless of mount type.

## Current focus: identity, not intent

The SDK answers **who and what** — human-like vs scripted vs LLM-like vs headless vs upload automation vs multimodal contradiction patterns. It does **not** fully answer **why** (fraudulent intent in business context). Intent is a future **server-side** layer once identity signals are solid.

## Goals

1. Classify sessions within the scoring API latency budget (e.g. **< 50ms p99** server-side).
2. Maintain very high **true-approval** rate for real users at each customer’s tolerance.
3. **Fast integration** — **`collect(selectorOrHTMLElement, { endpoint, sessionId })`** → **`{ flush, stop }`** (see **Integration surface** above).
4. **Low impact** on the page — asynchronous collection; target **~5ms** main-thread budget per cycle (see internal benchmarks).
5. **Dual packaging** — **ESM** for bundlers and **IIFE** (`window.BehaviorSDK`) for script tags; both emitted under **`apps/sdk/dist/`**.

## Core flow

```
Customer's page (form, modal, wizard, or any container)
  └── collect('#mount' | HTMLElement, { endpoint, sessionId })
        ├── attaches behavioral collectors (13): keystroke, mouse, touch, correction,
        │   paste, scroll, input-type, upload (+ EXIF), visibility, click,
        │   session-rhythm, field-timing
        ├── prewarms async fingerprint work where needed (e.g. audio, incognito)
        ├── reads fingerprint at flush (8): webdriver, iframe, canvas, webgl, audio,
        │   incognito, timezone, device persistence
        ├── attaches network collectors / snapshots (3): reaction, connection, timing
        ├── default: nearest <form> submit (if any) + tab hidden → flush()
        │     (no <form>? use handle.flush() from your app — e.g. SPA navigation)
        │     ├── collect signals → extractFeatures → run detections (6 rules)
        │     ├── deriveVerdict → BehaviorPayload
        │     └── sendBeacon(endpoint, JSON.stringify(payload))
        └── API: final actor_type / risk_score → customer systems (out of repo)
```

## Scope

**In scope (this repo):**

- Browser SDK under **`apps/sdk/src/`**
- Build output **`apps/sdk/dist/`** (ESM, IIFE globals, `.d.ts`)
- Client detections + **`features.ts`** + **`scoring.ts`**
- Next.js site **`apps/web/`** — marketing, docs (e.g. Fumadocs), **`/demo`** using the workspace package

**Out of scope:**

- Scoring API / ML / graph (closed services)
- Full **cryptographic** validation of authorized agents (SDK surfaces **claims** only)
- Intent-only fraud models
- Native mobile SDK (future)
- Agent-trust **`zoven-agent`** (separate package, if used)
- Customer-facing fraud **dashboard** as a product (demo UI is dev/education only)

## Success criteria

| Criterion | Target |
|-----------|--------|
| `npm run typecheck` (workspaces) | Zero errors, `strict: true` |
| `npm run build` (SDK) | Reliable build; ESM + IIFE + declarations |
| SDK main-thread impact | ~5ms per collection cycle (budget; measure in CI/harness when added) |
| ESM bundle size | ~15KB unminified guideline (`project-overview` / specs); verify after changes |

## Payload note

The canonical client-built shape is **`BehaviorPayload`** in **`apps/sdk/src/types.ts`** (`sessionId`, `collectedAt`, `signals`, `detections`, **`verdict`**). Server contracts should version any breaking JSON changes explicitly.
