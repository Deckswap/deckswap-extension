# CLAUDE.md

Rules that apply to the code as it exists right now.

## Project

Chrome MV3 side panel extension that imports a seller's Cardmarket Pokémon Singles stock into Deckswap. Three-step flow: Detect → Scan → Push. Built with React 19, Tailwind CSS 4, Vite 6, and `@crxjs/vite-plugin`.

## Stack

- **Runtime**: Chrome MV3, Side Panel API
- **UI**: React 19, Tailwind CSS 4
- **Build**: Vite 6 + `@crxjs/vite-plugin`
- **Auth**: Supabase email/password → JWT stored in `chrome.storage.local`
- **Language**: TypeScript strict

## Architecture

All state and flow logic lives in `App.tsx`. No state management library. No custom hooks outside the component files that use them.

```
src/
  App.tsx              # Single root component with all flow state
  background.ts        # Service worker only — no business logic
  lib/                 # Pure utility modules, no React
  popup/               # React UI — PopupShell + states + components
```

**Module layout — flat, no layers:**

```
lib/
  api.ts              # fetch wrapper → Deckswap API
  auth.ts             # Supabase sign-in / token refresh
  cmTab.ts            # find or open CM tab
  icon.ts             # canvas status dot on extension icon
  inlineDetect.ts     # injected into CM tab — import-free at runtime
  inlineScan.ts       # injected into CM tab — import-free at runtime
  sanitize.ts         # validate/clamp scraped data before state/API
  settings.ts         # user settings via chrome.storage.local
  types.ts            # canonical shared types
```

## Critical constraint: inline scripts

`inlineDetect.ts` and `inlineScan.ts` are injected into the Cardmarket tab via `chrome.scripting.executeScript`. They run in an isolated world with no access to the extension's module graph.

**Rules:**
- No runtime imports. TypeScript type imports are fine (erased at build time), value imports are not.
- All helpers must be defined inline within the exported function.
- Both files must remain self-contained. Validate this after any change.
- Locale values must be validated against the allowlist before being interpolated into a URL.

## Conventions

- **Types**: canonical types live in `lib/types.ts`. `lib/scraper.ts` is a re-export shim for backward compatibility — don't add to it.
- **Sanitisation**: all data from `executeScript` results passes through `lib/sanitize.ts` before touching state or the API. Treat executeScript results as untrusted input.
- **State**: `chrome.storage.local` for tokens, settings, scan checkpoint, scan result. Never store tokens anywhere else.
- **Error states**: `DetectResult` `reason` union covers all failure modes: `not-logged-in`, `fetch-error`, `rate-limited`, `no-cm-tab`, `no-articles`, `no-permission`. Add new reasons to the union in `types.ts` and handle them in `StateDetect.tsx`.
- **useEffect async**: `useEffect` callbacks cannot be `async`. Wrap async work in an IIFE `(async () => { ... })()` inside the callback.
- **No comments**: only add a comment when the WHY is non-obvious. Don't explain what the code does.

## Build rules (enforced in vite.config.ts)

- `VITE_DECKSWAP_API_URL` must be `https://` in production — throws at build time if not.
- `VITE_DEV_TOOLS` must be `false` in production — throws at build time if not.
- Content Security Policy is injected into the manifest **only in production** — Vite HMR in dev requires inline scripts that a strict CSP would block.
- `sourcemap: false` always. Never enable source maps in any build.

## Dev tools

`DEV_TOOLS = import.meta.env.VITE_DEV_TOOLS === 'true'` gates the dev modal. In production this compiles to `false` and the entire branch is tree-shaken out. Never ship with `VITE_DEV_TOOLS=true`.

## Security

- The Supabase publishable key and URLs are visible in the bundle — this is unavoidable and intentional. They are not secrets.
- Do not add any other external origin to the CSP `connect-src` without a documented reason.
- Do not use `dangerouslySetInnerHTML` anywhere.
- Do not add `web_accessible_resources` unless a web page genuinely needs to load an extension resource.

## Permissions

Current permissions are minimal. Do not add permissions without a concrete requirement. Each added permission appears on the Chrome Web Store install prompt and increases user friction.

## Don't

- Don't add a state management library. React state + `chrome.storage.local` is sufficient.
- Don't add runtime imports to `inlineDetect.ts` or `inlineScan.ts`.
- Don't add a new `DetectResult` reason without handling it in `StateDetect.tsx`.
- Don't use `chrome.storage.sync` — stock data is too large and sync quota is tiny.
- Don't make `useEffect` callbacks `async` — use an IIFE inside instead.
- Don't add source maps to any build configuration.
- Don't enable `VITE_DEV_TOOLS=true` in a production build.
- Don't add new external origins without updating the CSP in `vite.config.ts`.
- Don't use the badge API (`chrome.action.setBadgeText`) for status indicators — use the canvas icon approach in `lib/icon.ts` instead.
