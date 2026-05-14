// src/lib/sanitize.ts
//
// Validates and clamps data scraped from the Cardmarket DOM before it touches
// extension state or gets sent to the API. Treats executeScript results as
// untrusted input — even though we control the scraper, the page we inject into
// is an external origin.

import type { ScannedArticle } from './types';

const VALID_LOCALES = ['en', 'de', 'fr', 'es', 'it', 'pt', 'pl', 'cs', 'sk', 'hu', 'ro', 'nl'];

// Strips non-printable control characters and trims to a max length.
function safeStr(v: unknown, maxLen: number): string {
    if (typeof v !== 'string') return '';
    return v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').slice(0, maxLen);
}

// Clamps a number to [min, max]; returns 0 for NaN/Infinity.
function safeNum(v: unknown, min: number, max: number): number {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : 0;
}

function safeBool(v: unknown): boolean {
    return v === true;
}

// Allows only digits and a limited set of safe separator characters.
function safeId(v: unknown): string {
    return safeStr(v, 32).replace(/[^a-zA-Z0-9\-_]/g, '');
}

export function sanitizeArticle(raw: Record<string, unknown>): ScannedArticle | null {
    const articleId = safeId(raw.articleId);
    const idProduct = safeId(raw.idProduct);

    // Both IDs are required; without them the article is useless.
    if (!articleId || !idProduct) return null;

    return {
        articleId,
        idProduct,
        name:       safeStr(raw.name,      200),
        expansion:  safeStr(raw.expansion,  100),
        language:   safeStr(raw.language,    50),
        condition:  safeStr(raw.condition,   10),
        price:      safeNum(raw.price,    0, 1_000_000),
        quantity:   Math.round(safeNum(raw.quantity, 1, 10_000)),
        reverseHolo:  safeBool(raw.reverseHolo),
        firstEdition: safeBool(raw.firstEdition),
        signed:       safeBool(raw.signed),
        altered:      safeBool(raw.altered),
        playset:      safeBool(raw.playset),
        comments:   safeStr(raw.comments, 500),
    };
}

export function isValidLocale(locale: unknown): locale is string {
    return typeof locale === 'string' && VALID_LOCALES.includes(locale);
}
