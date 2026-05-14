# Deckswap Importer — Chrome Extension

A Chrome MV3 side panel extension that imports a seller's Cardmarket Pokémon Singles stock into Deckswap with one click. Scans all paginated stock pages, shows live progress, and pushes the result to the Deckswap API as draft listings.

---

## How it works

1. **Detect** — the extension finds an open Cardmarket tab and checks whether the seller is logged in and has Pokémon Singles listed.
2. **Scan** — a self-contained script is injected into the Cardmarket tab. It fetches each paginated stock page, parses the article rows, and writes progress to `window` globals that the side panel polls every 800 ms.
3. **Push** — the collected articles are sanitised and sent to the Deckswap API (`POST /v1/import/cardmarket`), which creates them as draft listings.

Authentication uses Supabase email/password. The JWT is stored in `chrome.storage.local` and refreshed automatically.

---

## Stack

| Layer | Choice |
|---|---|
| Extension API | Chrome MV3, Side Panel |
| UI | React 19, Tailwind CSS 4 |
| Build | Vite 6 + `@crxjs/vite-plugin` |
| Auth | Supabase (email/password → JWT) |
| Language | TypeScript strict |

---

## Project structure

```
src/
  App.tsx                      # Root component — all state and flow logic
  background.ts                # Service worker — opens side panel on icon click, notifies on CM tab load
  content.ts                   # Placeholder (unused; no content scripts)
  main.tsx                     # React entry point

  lib/
    api.ts                     # Authenticated fetch wrapper for the Deckswap API
    auth.ts                    # Supabase sign-in / sign-out / token refresh
    cmTab.ts                   # Find or open the Cardmarket browser tab
    dev.ts                     # Dev-only tools and fake article fixtures (tree-shaken in production)
    icon.ts                    # Canvas-drawn status dot on the extension icon
    inlineDetect.ts            # Self-contained detect function injected into the CM tab
    inlineScan.ts              # Self-contained scan function injected into the CM tab
    sanitize.ts                # Validates and clamps scraped article data before API submission
    scraper.ts                 # Re-exports from types.ts (backward-compat shim)
    settings.ts                # User settings — read/write via chrome.storage.local
    types.ts                   # Shared TypeScript types (DetectResult, ScannedArticle, ScanProgress)

  popup/
    PopupShell.tsx             # Layout shell: header, connection strip, footer, modal wiring
    icons/index.tsx            # Inline SVG icon components

    components/
      Button.tsx               # Primary / ghost / destructive-ghost button
      DevModal.tsx             # Dev tools modal (only rendered when VITE_DEV_TOOLS=true)
      FAQ.tsx                  # Collapsible FAQ accordion (used inside HelpModal)
      HelpModal.tsx            # ? button modal with FAQ and tips
      Pill.tsx                 # Small status pill badge
      SettingsModal.tsx        # Settings modal: account, Cardmarket options, scan speed, notifications
      StepStrip.tsx            # Detect → Scan → Push step indicator
      Toggle.tsx               # Accessible boolean toggle

    states/
      StateAuth.tsx            # Sign-in form
      StateDetect.tsx          # Pre-scan state: checking / detected / error variants
      StateScanning.tsx        # Live scan progress with article ticker and ETA
      StateComplete.tsx        # Post-scan summary with push button
```

---

## Environment variables

Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_DECKSWAP_API_URL=http://localhost:3000/v1
VITE_DEV_TOOLS=false
```

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL — used for auth only |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key — safe to expose in client bundles |
| `VITE_DECKSWAP_API_URL` | Deckswap API base URL. Must be `https://` in production builds |
| `VITE_DEV_TOOLS` | Set to `true` to enable the dev tools modal. Must be `false` in production |

> All `VITE_*` values are inlined as string literals in the bundle. Do not put secrets here.

---

## Development

```bash
yarn install
yarn dev
```

Then in Chrome:
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `dist/` folder
4. Open any Cardmarket tab and click the extension icon

The dev server runs HMR — most UI changes hot-reload without needing to reload the extension. Changes to `background.ts` or `manifest.json` require clicking **↻** in `chrome://extensions`.

### Dev tools

Set `VITE_DEV_TOOLS=true` in `.env` to unlock the dev tools modal (flask icon in the header). It lets you override the detect result and simulate rate limiting without touching Cardmarket.

---

## Production build

```bash
yarn build
```

The build:
- Injects a strict Content Security Policy into the manifest (`script-src 'self'; object-src 'none'; img-src 'self'; connect-src 'self' {supabase} {api}`)
- Enforces that `VITE_DECKSWAP_API_URL` is `https://`
- Enforces that `VITE_DEV_TOOLS` is `false`
- Produces no source maps

Output is in `dist/`. Load it unpacked in Chrome to verify before submitting to the Web Store.

---

## Key design decisions

**Self-contained inline scripts**
`inlineDetect.ts` and `inlineScan.ts` are injected into the Cardmarket tab via `chrome.scripting.executeScript`. They must be entirely self-contained at runtime — no imports survive the injection boundary. TypeScript types are erased at build time so type annotations are fine; runtime imports are not.

**Polling over messaging**
The scan script writes progress to `window.__deckswap_progress` and `window.__deckswap_rateLimit`. The side panel polls these globals every 800 ms via `executeScript`. This avoids needing a persistent message channel and survives the side panel being closed and reopened.

**Resumable scans**
After each page the scan script writes a checkpoint to `chrome.storage.local`. If the Cardmarket tab is closed mid-scan, the checkpoint is restored and the user can resume from the last completed page.

**Status dot on the icon**
The extension icon gets a canvas-drawn coloured dot: amber while scanning, green when complete, red on error. Uses `chrome.action.setIcon({ imageData })` rather than the badge API to have full control over size and position.

**Input sanitisation**
Data returned from `executeScript` is treated as untrusted (external origin). All article fields are validated and clamped by `lib/sanitize.ts` before touching React state or the API.

---

## Permissions

| Permission | Why |
|---|---|
| `activeTab` | Access the currently active tab |
| `notifications` | System notification when scan completes |
| `scripting` | Inject detect/scan functions into the Cardmarket tab |
| `sidePanel` | Render the extension as a side panel |
| `storage` | Auth tokens, settings, scan checkpoint, scan result |
| `tabs` | Query for open Cardmarket tabs |
| `unlimitedStorage` | Scan checkpoints can hold thousands of articles |
| `host_permissions: cardmarket.com` | Fetch stock pages with the seller's session cookies |
