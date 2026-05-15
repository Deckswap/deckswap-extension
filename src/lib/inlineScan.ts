// src/lib/inlineScan.ts
//
// Self-contained function injected into the CM tab via chrome.scripting.executeScript.
// Must remain import-free at runtime — all logic is inlined. Writes progress to
// window globals; the popup polls those globals every 800 ms.

export function inlineScan(params: {
    locale: string;
    speed: string;
    devOptions?: { simulateRateLimit: boolean };
    resumeFrom?: number;
    checkpointKey?: string;
}): Promise<Array<Record<string, unknown>>> {
    const ROWS_PER_PAGE = 40;
    const RATE_LIMIT_WAIT_S = 10;
    const PAGE_DELAY: Record<string, number> = { slow: 1000, normal: 400, fast: 100 };
    const w = window as any;

    function sleep(ms: number) {
        return new Promise<void>((resolve) => setTimeout(resolve, ms));
    }

    function parseRow(row: Element) {
        const idMatch = row.id.match(/articleRow(\d+)/);
        if (!idMatch) return null;
        const articleId = idMatch[1];

        const bsTitle =
            row.querySelector('.col-thumbnail span[data-bs-title]')?.getAttribute('data-bs-title') ?? '';
        const idProduct = bsTitle.match(/\/(\d+)\.jpg/)?.[1] ?? '';

        const name =
            row.querySelector('.col-seller a')?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
        const expansion =
            row.querySelector('.expansion-symbol')?.getAttribute('title') ?? '';
        const language =
            row.querySelector('.product-attributes span.icon[title]')?.getAttribute('title') ?? '';
        const condition =
            row.querySelector('.article-condition .badge')?.textContent?.trim() ?? '';

        // Strip thousands-separator dots before replacing the decimal comma
        const priceText = (
            row.querySelector('.col-offer .price-container .color-primary') ??
            row.querySelector('.color-primary')
        )?.textContent?.trim().replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '') ?? '0';
        const price = parseFloat(priceText) || 0;

        const quantityRaw =
            row.querySelector('.item-count')?.textContent?.trim() ??
            (row.querySelector('input.amount-input') as HTMLInputElement | null)?.getAttribute('max') ??
            '1';
        const quantity = parseInt(quantityRaw, 10) || 1;

        const attrTitles = Array.from(row.querySelectorAll('.product-attributes [title]')).map(
            (el) => el.getAttribute('title')?.toLowerCase() ?? '',
        );
        const reverseHolo = attrTitles.some((t) => t.includes('reverse'));
        const firstEdition = attrTitles.some((t) => t.includes('first') || t.includes('1st'));
        const signed = attrTitles.some((t) => t === 'signed');
        const altered = attrTitles.some((t) => t === 'altered');
        const playset = attrTitles.some((t) => t.includes('playset'));
        const comments =
            row.querySelector('.product-comments .d-block')?.textContent?.trim() ?? '';

        return {
            articleId, idProduct, name, expansion, language, condition,
            price, quantity, reverseHolo, firstEdition, signed, altered, playset, comments,
        };
    }

    return (async () => {
        const { locale, speed, devOptions, checkpointKey = 'deckswap:scan_checkpoint' } = params;

        const VALID_LOCALES = ['en', 'de', 'fr', 'es', 'it', 'pt', 'pl', 'cs', 'sk', 'hu', 'ro', 'nl'];
        if (!VALID_LOCALES.includes(locale)) return [];

        let page = params.resumeFrom ?? 1;
        const articles: NonNullable<ReturnType<typeof parseRow>>[] = [];
        const seen = new Set<string>();
        let totalPages: number | null = null;
        let simulatedRateLimit = false;

        if (page > 1) {
            const stored = await chrome.storage.local.get(checkpointKey);
            const cp = stored[checkpointKey] as { locale: string; articles: NonNullable<ReturnType<typeof parseRow>>[]; totalPages: number | null } | undefined;
            if (cp?.locale === locale && Array.isArray(cp.articles)) {
                for (const a of cp.articles) {
                    articles.push(a);
                    seen.add(a.articleId);
                }
                totalPages = cp.totalPages ?? null;
            }
        }

        w.__deckswap_progress = null;
        w.__deckswap_rateLimit = 0;

        while (true) {
            if (w.__deckswap_cancel) break;

            const url =
                `https://www.cardmarket.com/${locale}/Pokemon/Stock/Offers/Singles` +
                `?sortBy=name_asc&site=${page}`;

            const res = await fetch(url, { credentials: 'include' });

            if (res.status === 429) {
                for (let s = RATE_LIMIT_WAIT_S; s > 0; s--) {
                    w.__deckswap_rateLimit = s;
                    await sleep(1000);
                    if (w.__deckswap_cancel) return articles as unknown as Record<string, unknown>[];
                }
                w.__deckswap_rateLimit = 0;
                continue;
            }

            if (!res.ok) break;

            const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
            const rows = doc.querySelectorAll('[id^="articleRow"]');
            if (rows.length === 0) break;

            if (page === 1) {
                let max = 1;
                for (const link of doc.querySelectorAll('a[href*="site="]')) {
                    const m = link.getAttribute('href')?.match(/[?&]site=(\d+)/);
                    if (m) { const n = parseInt(m[1], 10); if (n > max) max = n; }
                }
                totalPages = max;
            }

            const totalCountEl = doc.querySelector('.total-count');
            const total = totalCountEl ? parseInt(totalCountEl.textContent ?? '', 10) || null : null;

            for (const row of Array.from(rows)) {
                const article = parseRow(row);
                if (article && !seen.has(article.articleId)) {
                    seen.add(article.articleId);
                    articles.push(article);

                    w.__deckswap_progress = {
                        scanned: articles.length,
                        total,
                        page,
                        totalPages,
                        recent: articles.slice(-3).reverse().map(
                            ({ name, condition, price, language, reverseHolo }) =>
                                ({ name, condition, price, language, reverseHolo }),
                        ),
                    };

                    if (devOptions?.simulateRateLimit && !simulatedRateLimit) {
                        simulatedRateLimit = true;
                        for (let s = RATE_LIMIT_WAIT_S; s > 0; s--) {
                            w.__deckswap_rateLimit = s;
                            await sleep(1000);
                            if (w.__deckswap_cancel) return articles as unknown as Record<string, unknown>[];
                        }
                        w.__deckswap_rateLimit = 0;
                    }
                }
            }

            if (totalPages != null ? page >= totalPages : rows.length < ROWS_PER_PAGE) break;

            await chrome.storage.local.set({
                [checkpointKey]: {
                    locale,
                    page: page + 1,
                    totalPages,
                    articleCount: articles.length,
                    articles,
                    savedAt: Date.now(),
                },
            });

            page++;
            await sleep(PAGE_DELAY[speed] ?? 400);
        }

        await chrome.storage.local.remove(checkpointKey);
        return articles as unknown as Record<string, unknown>[];
    })();
}
