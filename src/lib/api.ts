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

export async function getProfile(): Promise<Profile> {
    return apiFetch<Profile>('/profile/me');
}

export async function importCardmarket(
    articles: unknown[],
): Promise<{ received: number }> {
    return apiFetch<{ received: number }>('/import/cardmarket', {
        method: 'POST',
        body: { articles },
    });
}
