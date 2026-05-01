# Project Overview

## What this system does

A browser-side SDK that embeds into any web form, captures behavioral and fingerprint signals during a session, runs detection rules client-side, and sends a scored payload to the Zoven scoring API. The API classifies the session as **human**, **authorized AI agent**, or **unauthorized bot**, and delivers a risk score + alert into the customer's fraud queue.

## Goals

1. Classify any session into one of three actor types within the scoring API's latency budget (< 50ms p99).
2. Achieve > 99% true-approval rate for legitimate sessions at the customer's configured fraud tolerance.
3. SDK integrates into any web form in under 30 minutes with a single `collect()` call.
4. Zero impact on page performance — all signal collection is async, < 5ms main-thread per cycle.
5. Support both ESM (bundler import) and IIFE (`<script>` tag) embedding — both outputs ship in `dist/`.

## Core flow

```
Customer's page
  └── collect('#form', { endpoint, sessionId })
        ├── attaches behavioral collectors (keystroke, mouse, paste, scroll)
        ├── on submit / tab-close → flush()
        │     ├── collects fingerprint signals (webdriver, iframe, canvas)
        │     ├── runs detection rules (isHeadless, isScripted, isLLMAgent)
        │     └── sendBeacon(endpoint, JSON.stringify(payload))
        └── scoring API returns { actor_type, risk_score } → customer's fraud queue
```

## Scope

**In scope (this repo):**
- Browser signal collection SDK (`src/`)
- ESM + IIFE build output (`dist/`)
- Client-side detection rules (pre-scoring signal analysis)

**Out of scope:**
- Scoring API / ML classifier (closed, separate service)
- Cross-customer risk graph (closed)
- Mobile native SDK
- Agent-trust verification (`zoven-agent` — separate package)
- Dashboard UI

## Success criteria

| Criterion | Target |
|-----------|--------|
| `npm run typecheck` | Zero errors, `strict: true` |
| `npm run build` | Completes in < 5s, produces ESM + IIFE + `.d.ts` |
| SDK main-thread impact | < 5ms per collection cycle |
| Bundle size | < 15KB unminified (currently 11.7KB ESM) |
