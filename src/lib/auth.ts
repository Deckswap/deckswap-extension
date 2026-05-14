// src/lib/auth.ts
//
// Handles Supabase authentication and token storage for the extension.
// Tokens live in chrome.storage.local so they persist across popup opens.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const STORAGE_KEY = 'deckswap_auth';

type StoredAuth = {
    accessToken: string;
    refreshToken: string;
    expiresAt: number; // unix ms
};

type SupabaseTokenResponse = {
    access_token: string;
    refresh_token: string;
    expires_in: number; // seconds
    token_type: string;
    user: { id: string; email: string };
};

type SupabaseErrorResponse = {
    error: string;
    error_description?: string;
    msg?: string;
};

export class AuthError extends Error {
    code: 'invalid_credentials' | 'network' | 'unknown';

    constructor(
        code: 'invalid_credentials' | 'network' | 'unknown',
        message: string,
    ) {
        super(message);
        this.code = code;
        this.name = 'AuthError';
    }
}

/* ─── STORAGE ─────────────────────────────────────── */

async function readStored(): Promise<StoredAuth | null> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return (result[STORAGE_KEY] as StoredAuth | undefined) ?? null;
}

async function writeStored(auth: StoredAuth): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: auth });
}

async function clearStored(): Promise<void> {
    await chrome.storage.local.remove(STORAGE_KEY);
}

function toStored(res: SupabaseTokenResponse): StoredAuth {
    return {
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
        // Refresh 60 seconds before the token actually expires
        expiresAt: Date.now() + (res.expires_in - 60) * 1000,
    };
}

/* ─── PUBLIC API ──────────────────────────────────── */

/**
 * Log in with email + password. Stores tokens on success.
 * Throws AuthError on failure.
 */
export async function signIn(email: string, password: string): Promise<void> {
    let response: Response;
    try {
        response = await fetch(
            `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: SUPABASE_KEY,
                },
                body: JSON.stringify({ email, password }),
            },
        );
    } catch {
        throw new AuthError(
            'network',
            "Couldn't reach Deckswap. Check your connection.",
        );
    }

    if (!response.ok) {
        const body: SupabaseErrorResponse = await response.json().catch(() => ({
            error: 'unknown',
        }));
        if (response.status === 400) {
            throw new AuthError(
                'invalid_credentials',
                'Wrong email or password.',
            );
        }
        throw new AuthError(
            'unknown',
            body.error_description || body.msg || 'Sign-in failed.',
        );
    }

    const data: SupabaseTokenResponse = await response.json();
    await writeStored(toStored(data));
}

/** Removes stored tokens. */
export async function signOut(): Promise<void> {
    await clearStored();
}

/** Returns true if there's a stored auth (regardless of expiry). */
export async function isAuthenticated(): Promise<boolean> {
    return (await readStored()) !== null;
}

/**
 * Returns a valid access token, refreshing if needed.
 * Returns null if not authenticated, or if refresh fails.
 */
export async function getAccessToken(): Promise<string | null> {
    const stored = await readStored();
    if (!stored) return null;

    if (Date.now() < stored.expiresAt) {
        return stored.accessToken;
    }

    // Token expired — try refresh
    try {
        const response = await fetch(
            `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: SUPABASE_KEY,
                },
                body: JSON.stringify({ refresh_token: stored.refreshToken }),
            },
        );

        if (!response.ok) {
            await clearStored();
            return null;
        }

        const data: SupabaseTokenResponse = await response.json();
        const refreshed = toStored(data);
        await writeStored(refreshed);
        return refreshed.accessToken;
    } catch {
        return null;
    }
}
