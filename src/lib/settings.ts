// src/lib/settings.ts

export type ScanSpeed = 'slow' | 'normal' | 'fast';

export type Settings = {
    locale: string | null; // null = auto-detect
    scanSpeed: ScanSpeed;
    autoOpenCmTab: boolean;
    notifyOnComplete: boolean;
};

export const SETTINGS_DEFAULTS: Settings = {
    locale: null,
    scanSpeed: 'normal',
    autoOpenCmTab: true,
    notifyOnComplete: true,
};

export const LOCALES: { code: string; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
    { code: 'it', label: 'Italiano' },
    { code: 'pt', label: 'Português' },
    { code: 'cs', label: 'Čeština' },
    { code: 'sk', label: 'Slovenčina' },
    { code: 'hu', label: 'Magyar' },
    { code: 'ro', label: 'Română' },
    { code: 'nl', label: 'Nederlands' },
    { code: 'pl', label: 'Polski' },
];

export const PAGE_DELAY_MS: Record<ScanSpeed, number> = {
    slow: 1000,
    normal: 400,
    fast: 100,
};

const STORAGE_KEY = 'deckswap_settings';

export async function getSettings(): Promise<Settings> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return { ...SETTINGS_DEFAULTS, ...(result[STORAGE_KEY] ?? {}) };
}

export async function saveSettings(patch: Partial<Settings>): Promise<void> {
    const current = await getSettings();
    await chrome.storage.local.set({ [STORAGE_KEY]: { ...current, ...patch } });
}
