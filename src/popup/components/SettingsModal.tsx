// src/popup/components/SettingsModal.tsx

import { useEffect, useState } from 'react';
import {
    LOCALES,
    SETTINGS_DEFAULTS,
    getSettings,
    saveSettings,
    type ScanSpeed,
    type Settings,
} from '../../lib/settings';
import { Toggle } from './Toggle';

type SettingsModalProps = {
    open: boolean;
    onClose: () => void;
    deckswapUsername: string | null;
    onSignOut: () => void;
    onSettingsChange: (s: Settings) => void;
};

const SPEEDS: { value: ScanSpeed; label: string; hint: string }[] = [
    { value: 'slow', label: 'Slow', hint: '1s between pages' },
    { value: 'normal', label: 'Normal', hint: '400ms between pages' },
    { value: 'fast', label: 'Fast', hint: '100ms between pages' },
];

export function SettingsModal({
    open,
    onClose,
    deckswapUsername,
    onSignOut,
    onSettingsChange,
}: SettingsModalProps) {
    const [settings, setSettings] = useState<Settings>(SETTINGS_DEFAULTS);

    useEffect(() => {
        if (!open) return;
        getSettings().then(setSettings);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    const update = async (patch: Partial<Settings>) => {
        const next = { ...settings, ...patch };
        setSettings(next);
        await saveSettings(patch);
        onSettingsChange(next);
    };

    const handleSignOut = () => {
        onClose();
        onSignOut();
    };

    return (
        <>
            <button
                aria-label="Close settings"
                onClick={onClose}
                className="fixed inset-0 z-40 bg-bg-1/70 backdrop-blur-sm cursor-default"
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-label="Settings"
                className="fixed inset-0 z-50 m-3 bg-bg-2 border border-line-2 rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-none"
            >
                <div className="flex flex-col h-full pointer-events-auto">
                    {/* Header */}
                    <header className="flex items-center px-4 py-3 border-b border-line-1 flex-shrink-0">
                        <h2 className="text-[15px] font-bold tracking-[-0.02em] text-ink-1">
                            Settings
                        </h2>
                        <button
                            onClick={onClose}
                            aria-label="Close settings"
                            className="ml-auto w-7 h-7 rounded-sm flex items-center justify-center text-ink-3 hover:text-ink-1 cursor-pointer hover:bg-bg-3 transition-all duration-[180ms]"
                        >
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </header>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin flex flex-col gap-5">

                        {/* ── Account ── */}
                        <section>
                            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-3 mb-3">
                                Account
                            </p>
                            <div className="bg-bg-3 border border-line-2 rounded-lg overflow-hidden">
                                <div className="flex items-center gap-3 px-4 py-3.5">
                                    <div className="w-8 h-8 rounded-full bg-blue-bg border border-blue-border flex items-center justify-center flex-shrink-0">
                                        <span className="font-mono text-[12px] font-bold text-blue">DS</span>
                                    </div>
                                    <div className="flex flex-col min-w-0 leading-[1.3]">
                                        <span className="font-mono text-[10px] font-semibold tracking-[0.10em] uppercase text-ink-3">
                                            Deckswap
                                        </span>
                                        {deckswapUsername ? (
                                            <span className="text-[13px] font-semibold text-ink-1 truncate">
                                                {deckswapUsername}
                                            </span>
                                        ) : (
                                            <span className="text-[12px] font-semibold text-ink-3 italic">
                                                Not connected
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="h-px bg-line-1 mx-4" />
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer hover:bg-bg-4 transition-colors duration-[180ms] group"
                                >
                                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-ink-3 group-hover:text-red-text flex-shrink-0 transition-colors duration-[180ms]">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    <span className="text-[13px] font-semibold text-ink-2 group-hover:text-red-text transition-colors duration-[180ms]">
                                        Sign out
                                    </span>
                                </button>
                            </div>
                        </section>

                        {/* ── Cardmarket ── */}
                        <section>
                            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-3 mb-3">
                                Cardmarket
                            </p>
                            <div className="bg-bg-3 border border-line-2 rounded-lg overflow-hidden">
                                <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                                    <div className="flex flex-col leading-[1.3]">
                                        <span className="text-[13px] font-semibold text-ink-1">
                                            Auto-open tab
                                        </span>
                                        <span className="text-[11px] text-ink-3 mt-0.5">
                                            Open Cardmarket in the background if no tab is found
                                        </span>
                                    </div>
                                    <Toggle
                                        checked={settings.autoOpenCmTab}
                                        onChange={(v) => update({ autoOpenCmTab: v })}
                                    />
                                </div>
                                <div className="h-px bg-line-1 mx-4" />
                                <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                                    <div className="flex flex-col leading-[1.3]">
                                        <span className="text-[13px] font-semibold text-ink-1">
                                            Account language
                                        </span>
                                        <span className="text-[11px] text-ink-3 mt-0.5">
                                            Only change if auto-detect picks the wrong language
                                        </span>
                                    </div>
                                    <div className="relative flex-shrink-0">
                                        <select
                                            value={settings.locale ?? ''}
                                            onChange={(e) =>
                                                update({ locale: e.target.value || null })
                                            }
                                            className="appearance-none bg-bg-2 border border-line-2 rounded-md pl-2.5 pr-7 py-1.5 text-[12px] font-semibold text-ink-1 cursor-pointer focus:outline-none focus:border-blue transition-colors duration-[180ms]"
                                        >
                                            <option value="">Auto-detect</option>
                                            {LOCALES.map((l) => (
                                                <option key={l.code} value={l.code}>
                                                    {l.label}
                                                </option>
                                            ))}
                                        </select>
                                        <svg
                                            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-3"
                                            width={12}
                                            height={12}
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2.5}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── Scan ── */}
                        <section>
                            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-3 mb-3">
                                Scan
                            </p>
                            <div className="bg-bg-3 border border-line-2 rounded-lg overflow-hidden">
                                <div className="px-4 py-3.5">
                                    <div className="flex flex-col gap-2.5">
                                        <div className="flex flex-col leading-[1.3]">
                                            <span className="text-[13px] font-semibold text-ink-1">
                                                Speed
                                            </span>
                                            <span className="text-[11px] text-ink-3 mt-0.5">
                                                Slow down if Cardmarket rate-limits you
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            {SPEEDS.map((s) => (
                                                <button
                                                    key={s.value}
                                                    onClick={() => update({ scanSpeed: s.value })}
                                                    title={s.hint}
                                                    className={[
                                                        'flex-1 py-2 rounded-md text-[12px] font-semibold cursor-pointer border transition-all duration-[180ms]',
                                                        settings.scanSpeed === s.value
                                                            ? 'bg-blue-bg border-blue-border text-blue'
                                                            : 'bg-bg-2 border-line-2 text-ink-3 hover:text-ink-1',
                                                    ].join(' ')}
                                                >
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="h-px bg-line-1 mx-4" />
                                <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                                    <div className="flex flex-col leading-[1.3]">
                                        <span className="text-[13px] font-semibold text-ink-1">
                                            Notify when done
                                        </span>
                                        <span className="text-[11px] text-ink-3 mt-0.5">
                                            Get a notification when the scan finishes
                                        </span>
                                    </div>
                                    <Toggle
                                        checked={settings.notifyOnComplete}
                                        onChange={(v) => update({ notifyOnComplete: v })}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Footer */}
                    <footer className="px-4 py-3 border-t border-line-1 flex-shrink-0 bg-bg-1/30">
                        <p className="font-mono text-[10px] font-semibold tracking-[0.06em] text-ink-3 text-center">
                            Deckswap Importer v{chrome.runtime.getManifest().version}
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
}
