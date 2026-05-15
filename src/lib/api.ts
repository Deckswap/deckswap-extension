// src/lib/api.ts
//
// Thin fetch wrapper for the Deckswap API. Auto-injects the Bearer token,
// handles 401 by refreshing once, and surfaces typed errors to callers.

import { getAccessToken, signOut } from './auth';

const API_URL = import.meta.env.VITE_DECKSWAP_API_URL;

export class ApiError extends Error {
    status: number;
    code: string;

    constructor(status: number, code: string, message: string) {
        super(message);
        this.status = status;
        this.code = code;
        this.name = 'ApiError';
    }
}

type RequestOptions = {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: unknown;
};

/**
 * Make an authenticated request to the Deckswap API.
 * Returns parsed JSON on 2xx, throws ApiError otherwise.
 */
export async function apiFetch<T>(
    path: string,
    options: RequestOptions = {},
): Promise<T> {
    const token = await getAccessToken();
    if (!token) {
        throw new ApiError(401, 'not_authenticated', 'Not signed in.');
    }

    const { method = 'GET', body } = options;

    let response: Response;
    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                ...(body !== undefined
                    ? { 'Content-Type': 'application/json' }
                    : {}),
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError(0, 'network', "Couldn't reach Deckswap.");
    }

    if (response.status === 401) {
        await signOut();
        throw new ApiError(401, 'session_expired', 'Your session has expired.');
    }

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new ApiError(
            response.status,
            errorBody.code || 'unknown',
            errorBody.message || `Request failed (${response.status}).`,
        );
    }

    return response.json() as Promise<T>;
}

/* ─── TYPED ENDPOINTS ─────────────────────────────── */

export type Profile = {
    id: string;
    username: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: string;
};

const PROFILE_CACHE_KEY = 'deckswap_profile';

export async function getProfile(): Promise<Profile> {
    const cached = await chrome.storage.local.get(PROFILE_CACHE_KEY);
    if (cached[PROFILE_CACHE_KEY]) return cached[PROFILE_CACHE_KEY] as Profile;

    const profile = await apiFetch<Profile>('/profile/me');
    await chrome.storage.local.set({ [PROFILE_CACHE_KEY]: profile });
    return profile;
}

export async function clearProfileCache(): Promise<void> {
    await chrome.storage.local.remove(PROFILE_CACHE_KEY);
}

export type ImportMode = 'ADD' | 'SYNC';

export interface ImportCardmarketResult {
    batchId: string;
    imported: number;
    updated: number;
    deleted: number;
    skipped: number;
    unmatched: number;
    unmatchedArticles: Array<{ name: string; reason: string }>;
}

export interface LatestBatchResult {
    id: string;
    mode: ImportMode;
    articleCount: number;
    importedAt: string;
    draft: number;
    active: number;
    soldOut: number;
    deleted: number;
}

export async function importCardmarket(
    articles: unknown[],
    mode: ImportMode,
): Promise<ImportCardmarketResult> {
    return apiFetch<ImportCardmarketResult>('/import/cardmarket', {
        method: 'POST',
        body: { articles, mode },
    });
}

export async function getLatestImportBatch(): Promise<LatestBatchResult | null> {
    return apiFetch<LatestBatchResult | null>('/import/cardmarket/latest');
}
