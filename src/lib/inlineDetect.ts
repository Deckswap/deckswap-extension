// src/lib/inlineDetect.ts
//
// Self-contained function injected into the CM tab via chrome.scripting.executeScript.
// Must remain import-free at runtime — types are erased at build time.

type DetectResult =
    | { onStockPage: false; reason: 'not-logged-in' | 'fetch-error' | 'rate-limited' | 'no-cm-tab' }
    | { onStockPage: true; articleCount: number | null; username: string | null; locale: string };

export async function inlineDetect(pinnedLocale: string | null): Promise<DetectResult> {
    const LOCALE_CODES = ['en', 'de', 'fr', 'es', 'it', 'pt', 'pl', 'cs', 'sk', 'hu', 'ro', 'nl'];
    const CACHED_KEY = 'detectedLocale';

    let localesToTry: string[];
    if (pinnedLocale) {
        if (!LOCALE_CODES.includes(pinnedLocale)) return { onStockPage: false, reason: 'fetch-error' };
        localesToTry = [pinnedLocale];
    } else {
        let cached: string | null = null;
        try {
            const stored = await chrome.storage.local.get(CACHED_KEY);
            cached = (stored[CACHED_KEY] as string) ?? null;
        } catch { /* ignore */ }
        const rest = LOCALE_CODES.filter((l) => l !== cached);
        localesToTry = cached ? [cached, ...rest] : [...LOCALE_CODES];
    }

    for (const locale of localesToTry) {
        const url = `https://www.cardmarket.com/${locale}/Pokemon/Stock/Offers/Singles?sortBy=name_asc`;
        let html: string;
        try {
            const res = await fetch(url, { credentials: 'include' });
            if (res.status === 429) return { onStockPage: false, reason: 'rate-limited' };
            if (!res.ok) continue;
            html = await res.text();
        } catch {
            return { onStockPage: false, reason: 'fetch-error' };
        }

        const doc = new DOMParser().parseFromString(html, 'text/html');
        const rows = doc.querySelectorAll('[id^="articleRow"]');

        if (rows.length === 0) {
            if (doc.querySelector('form[action*="login"]')) {
                return { onStockPage: false, reason: 'not-logged-in' };
            }
            // Logged in but stock is empty — username is still visible
            const loggedInUsername =
                doc.querySelector<HTMLElement>('.dropdown-header.d-lg-none span')?.textContent?.trim() ?? null;
            if (loggedInUsername) {
                return { onStockPage: true, articleCount: 0, username: loggedInUsername, locale };
            }
            continue;
        }

        const username =
            doc.querySelector<HTMLElement>('.dropdown-header.d-lg-none span')?.textContent?.trim() ?? null;

        const totalCountEl = doc.querySelector('.total-count');
        const articleCount: number | null = totalCountEl
            ? parseInt(totalCountEl.textContent ?? '', 10) || null
            : rows.length;

        try {
            await chrome.storage.local.set({ [CACHED_KEY]: locale });
        } catch { /* ignore */ }

        return { onStockPage: true, articleCount, username, locale };
    }

    return { onStockPage: false, reason: 'fetch-error' };
}
