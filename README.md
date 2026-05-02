# nyasa

> **See who is behind the form** — humans, scripted bots, headless browsers, and LLM-style agents leave different traces. nyasa collects behavioral, fingerprint, and network signals in the browser, runs **client-side detection rules**, and posts a structured payload to **your** endpoint so you can decide what to do next.

[![Website — docs & demo](https://img.shields.io/badge/site-docs%20%26%20demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://nyasa-beta.vercel.app/)
[![npm](https://img.shields.io/npm/v/@devanshhq/nyasa?style=for-the-badge&logo=npm&label=npm&color=CB3837)](https://www.npmjs.com/package/@devanshhq/nyasa)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

`browser-sdk` · `behavioral-signals` · `bot-detection` · `llm-agents` · `fraud-adjacent`

---

## The problem

Automation does not announce itself. Headless runtimes, scripted fill, and agent-driven browsers often **look like a normal session on the server**. By the time a request hits your API, you have already lost timing and environment detail that only exists in the client. nyasa runs **in the page**: it attaches collectors, evaluates detections locally, and uses `sendBeacon` to forward a payload you can score or route—without asking visitors for extra steps.

---

## What you get

| Area | What |
| :--- | :--- |
| **Identity, not intent** | Answers *who or what* is likely operating the browser. Product and risk rules stay on your side. |
| **Documented signals** | Behavioral, fingerprint, and network pillars described in the docs—so you know what each field implies. |
| **Two ways to load** | **ESM** for bundlers and an **IIFE** build when you need a script tag ([see Quickstart](https://nyasa-beta.vercel.app/docs/quickstart)). |
| **Try before you integrate** | Full docs, API reference, and a live demo on **[nyasa-beta.vercel.app](https://nyasa-beta.vercel.app/)**. |

---

## Documentation

**Start here → [Quickstart](https://nyasa-beta.vercel.app/docs/quickstart)** · [Home](https://nyasa-beta.vercel.app/docs) · [Demo](https://nyasa-beta.vercel.app/demo)

Docs are written in MDX under [`apps/web/content/docs/`](apps/web/content/docs/). For how to add pages, see [`apps/web/DOCUMENTATION.md`](apps/web/DOCUMENTATION.md).

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

const handle = collect("#signup-form", {
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
