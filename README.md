# nyasa

> **See who is really in the browser** — humans, scripted automation, headless runtimes, and LLM-style agents leave different traces. nyasa collects behavioral, fingerprint, and network signals in the page, runs **client-side detection rules**, and posts a structured payload to **your** endpoint so you can score or route the session.

[![Website — docs & demo](https://img.shields.io/badge/site-docs%20%26%20demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://nyasa-beta.vercel.app/)
[![npm](https://img.shields.io/npm/v/@devanshhq/nyasa?style=for-the-badge&logo=npm&label=npm&color=CB3837)](https://www.npmjs.com/package/@devanshhq/nyasa)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

`browser-sdk` · `behavioral-signals` · `bot-detection` · `llm-agents` · `fraud-adjacent`

---

## The problem

Automation does not announce itself. Bots and agents often **look like a normal browser session** once traffic reaches your API. You lose timing and environment detail that only exists on the client. nyasa runs **in the page**: it attaches collectors across the **document and your chosen container**, evaluates detections locally, and uses `sendBeacon` to forward a payload you can score or route—without asking visitors for extra steps.

---

## What you get

| Area | What |
| :--- | :--- |
| **Identity, not intent** | Surfaces *who or what* is likely operating the session. Business and risk rules stay on your side. |
| **Documented signals** | Behavioral, fingerprint, and network pillars described in the docs—so you know what each field implies. |
| **Flows beyond a single form** | Attach to a **wrapper element** (checkout, login, onboarding, agent surface) or scale up; many collectors already run at **document** scope. |
| **Two ways to load** | **ESM** for bundlers and an **IIFE** build for a script tag ([Quickstart](https://nyasa-beta.vercel.app/docs/quickstart)). |
| **Try it live** | Docs, API reference, and an interactive demo at **[nyasa-beta.vercel.app](https://nyasa-beta.vercel.app/)**. |

---

## Documentation

**Start here → [Quickstart](https://nyasa-beta.vercel.app/docs/quickstart)** · [Docs home](https://nyasa-beta.vercel.app/docs) · [Demo](https://nyasa-beta.vercel.app/demo)

---

## Install

```bash
npm install @devanshhq/nyasa
```

**Package:** [`@devanshhq/nyasa`](https://www.npmjs.com/package/@devanshhq/nyasa) · ![](https://img.shields.io/npm/v/@devanshhq/nyasa?style=flat-square&logo=npm&color=CB3837)

---

## Minimal example

```ts
import { collect } from "@devanshhq/nyasa";

// Pass a form, a div around a wizard, a section, or document.body — see Quickstart.
const handle = collect("#your-flow-root", {
  endpoint: "https://your-api.example.com/ingest",
  sessionId: crypto.randomUUID(),
});
```

---

## Monorepo

| Path | Role |
| :--- | :--- |
| [`apps/sdk/`](apps/sdk/) | Published **`@devanshhq/nyasa`** — `npm run build` → `dist/` (ESM + IIFE + types) |
| [`apps/web/`](apps/web/) | Next.js — marketing site, `/docs`, `/demo` |

---

## Development

```bash
npm install
npm run web        # site + docs + demo
npm run build      # SDK only
npm run typecheck  # all workspaces
```
