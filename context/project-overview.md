# Project Overview

## What this system does

A browser-side SDK that embeds into any web form, captures behavioral and fingerprint signals during a session, runs detection rules client-side, and sends a scored payload to the Zoven scoring API. The API classifies the session as **human**, **authorized AI agent**, or **unauthorized bot**, and delivers a risk score into the customer's fraud queue.

## Current focus: identity, not intent

The SDK answers **who and what** — is this a human, a scripted bot, an LLM agent, or a headless browser? It does not currently evaluate **why** (what is the actor trying to do, is the action fraudulent given context). Intent analysis is a future server-side concern once identity classification is solid. All signal and detection work is scoped to identity.

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
        ├── attaches behavioral collectors (8: keystroke, mouse, touch, correction,
        │   paste, scroll, input-type, upload)
        ├── prewarms fingerprint collectors (5: webdriver, iframe, canvas, webgl, audio)
        ├── attaches network collectors (3: reaction, connection, timing)
        ├── on submit / tab-close → flush()
        │     ├── collects all signals
        │     ├── runs detection rules (isHeadless, isScripted, isLLMAgent, isUploadAutomation)
        │     └── sendBeacon(endpoint, JSON.stringify(payload))
        └── scoring API returns { actor_type, risk_score } → customer's fraud queue
```

## Scope

**In scope (this repo):**
- Browser signal collection SDK (`apps/sdk/src/`)
- ESM + IIFE build output (`apps/sdk/dist/`)
- Client-side detection rules (pre-scoring signal analysis)
- Demo app (`apps/demo/`) — live integration showcase with synthetic scenarios

**Out of scope:**
- Scoring API / ML classifier (closed, separate service)
- Cross-customer risk graph (closed)
- Intent analysis / behavioral fraud patterns (future server-side layer)
- Mobile native SDK
- Agent-trust verification (`zoven-agent` — separate package)
- Dashboard UI

## Success criteria

| Criterion | Target |
|-----------|--------|
| `npm run typecheck` | Zero errors, `strict: true` |
| `npm run build` | Completes in < 5s, produces ESM + IIFE + `.d.ts` |
| SDK main-thread impact | < 5ms per collection cycle |
| Bundle size | < 15KB unminified ESM |
