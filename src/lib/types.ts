// src/lib/types.ts — shared domain types used across the extension

export type DetectResult =
    | { onStockPage: false; reason: 'not-logged-in' | 'fetch-error' | 'rate-limited' | 'no-cm-tab' | 'no-articles' | 'no-permission' }
    | { onStockPage: true; articleCount: number | null; username: string | null; locale: string };

export type ScannedArticle = {
    articleId: string;
    idProduct: string;
    name: string;
    expansion: string;
    language: string;
    condition: string;
    price: number;
    quantity: number;
    reverseHolo: boolean;
    firstEdition: boolean;
    signed: boolean;
    altered: boolean;
    playset: boolean;
    comments: string;
};

export type ScanProgress = {
    scanned: number;
    total: number | null;
    page: number;
    totalPages: number | null;
    recent: { name: string; condition: string; price: number; language: string; reverseHolo: boolean }[];
};
