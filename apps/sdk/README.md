# @devanshhq/nyasa

Browser-side behavior analysis SDK. Classifies every session as **human**, **authorized agent**, or **unauthorized bot** by the time you need a decision.

## Install

```bash
npm install @devanshhq/nyasa
```

Or via script tag (IIFE build):

```html
<script src="https://unpkg.com/@devanshhq/nyasa/dist/index.global.js"></script>
```

## Quick start

```ts
import { collect } from '@devanshhq/nyasa'

const handle = collect('#signup-form', {
  endpoint: 'https://your-scoring-api.com/score',
  sessionId: crypto.randomUUID(),
})

// Flush manually in SPA flows (no <form> submit)
handle.flush()

// Stop collecting and clean up
handle.stop()
```

`collect` accepts a CSS selector or any `HTMLElement`. It attaches collectors to that element and the page, then flushes automatically on the nearest `<form>` submit or tab close.

## What it collects

**Behavioral (13 signals)**
Keystroke dwell and flight time, mouse path and curvature, touch, paste ratio, scroll depth, corrections, click precision, session rhythm, field timing, input origin, file upload mechanics, and tab visibility.

**Fingerprint (8 signals)**
Webdriver markers, WebGL renderer, canvas fingerprint, audio fingerprint, iframe consistency, incognito mode, timezone vs locale consistency, and device persistence.

**Network (3 signals)**
Focus-to-input reaction time, connection type, and page load timing.

## The actor model

| Actor | What it means |
|---|---|
| `Human` | Organic behavior, consistent device. No detection rules fired. |
| `AuthorizedAgent` | Valid cryptographic identity present (RFC 9421). Server must verify. |
| `UnauthorizedBot` | One or more detection rules fired. |

## Detection rules

Six rules run at flush time: `isHeadless`, `isScripted`, `isLLMAgent`, `isAuthorizedAgent`, `isUploadAutomation`, and `isMultimodalBot`. Each returns a `DetectionResult` with `detected`, `severity`, and `reasons`.

## Authorized agent support

Agents can declare their identity via:

```ts
// JS global (set before page scripts run)
window.__nyasaAgentSignature = 'v1:your-signature-here'
```

```html
<!-- or via meta tag -->
<meta name="x-agent-signature" content="v1:your-signature-here" />
```

The SDK surfaces the claim client-side. Cryptographic validation is the server's responsibility.

## API

### `collect(target, options)`

| Param | Type | Description |
|---|---|---|
| `target` | `string \| HTMLElement` | CSS selector or DOM element to mount on |
| `options.endpoint` | `string` | URL to send the payload to |
| `options.sessionId` | `string` | Unique session identifier |

Returns `{ flush, stop }`.

### `BehaviorScanner`

Lower-level class for custom orchestration:

```ts
import { BehaviorScanner } from '@devanshhq/nyasa'

const scanner = new BehaviorScanner()
scanner.attach(document.querySelector('#form'))
const payload = scanner.buildPayload(sessionId)
scanner.detach()
```

## Payload shape

```ts
type BehaviorPayload = {
  sessionId: string
  collectedAt: string       // ISO timestamp
  signals: CollectedSignals // raw signals across all three pillars
  detections: Detections    // per-rule results
  verdict: Verdict          // Human | AuthorizedAgent | UnauthorizedBot
}
```

The payload is sent via `navigator.sendBeacon` (non-blocking, survives page unload).

## Full documentation

https://nyasa.devanshtiwari.com/docs

## License

MIT
