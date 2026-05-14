// src/popup/components/DevModal.tsx

import { useEffect } from 'react';
import { DEV_DEFAULTS, type DetectOverride, type DevOptions } from '../../lib/dev';
import { Toggle } from './Toggle';

type DevModalProps = {
    open: boolean;
    onClose: () => void;
    devOptions: DevOptions;
    onDevOptionsChange: (opts: DevOptions) => void;
    onJumpToComplete: () => void;
    onJumpToScanning: () => void;
};

const DETECT_OVERRIDES: { value: DetectOverride; label: string }[] = [
    { value: 'real', label: 'Real' },
    { value: 'detected', label: 'Detected' },
    { value: 'not-logged-in', label: 'Not logged in' },
    { value: 'fetch-error', label: 'Fetch error' },
];

export function DevModal({
    open,
    onClose,
    devOptions,
    onDevOptionsChange,
    onJumpToComplete,
    onJumpToScanning,
}: DevModalProps) {
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    const update = (patch: Partial<DevOptions>) =>
        onDevOptionsChange({ ...devOptions, ...patch });

    const reset = () => onDevOptionsChange(DEV_DEFAULTS);

    return (
        <>
            <button
                aria-label="Close dev tools"
                onClick={onClose}
                className="fixed inset-0 z-40 bg-bg-1/70 backdrop-blur-sm cursor-default"
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-label="Dev tools"
                className="fixed inset-0 z-50 m-3 bg-bg-2 border border-gold-border rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-none"
            >
                <div className="flex flex-col h-full pointer-events-auto">
                    {/* Header */}
                    <header className="flex items-center px-4 py-3 border-b border-line-1 flex-shrink-0">
                        <h2 className="text-[15px] font-bold tracking-[-0.02em] text-ink-1">
                            Dev tools
                        </h2>
                        <span className="ml-2 font-mono text-[9px] font-bold tracking-[0.14em] uppercase px-1.5 py-0.5 rounded bg-gold-bg text-gold border border-gold-border">
                            DEV
                        </span>
                        <button
                            onClick={onClose}
                            aria-label="Close dev tools"
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

                        {/* ── Detect ── */}
                        <section>
                            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-3 mb-3">
                                Detect
                            </p>
                            <div className="bg-bg-3 border border-line-2 rounded-lg px-4 py-3.5 flex flex-col gap-2.5">
                                <div className="flex flex-col leading-[1.3]">
                                    <span className="text-[13px] font-semibold text-ink-1">
                                        Override detect result
                                    </span>
                                    <span className="text-[11px] text-ink-3 mt-0.5">
                                        Bypasses the real Cardmarket fetch
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    {DETECT_OVERRIDES.map((o) => (
                                        <button
                                            key={o.value}
                                            onClick={() => update({ detectOverride: o.value })}
                                            className={[
                                                'py-2 px-2 rounded-md text-[11px] font-semibold cursor-pointer border transition-all duration-[180ms] text-left leading-[1.3]',
                                                devOptions.detectOverride === o.value
                                                    ? 'bg-gold-bg border-gold-border text-gold'
                                                    : 'bg-bg-2 border-line-2 text-ink-3 hover:text-ink-1',
                                            ].join(' ')}
                                        >
                                            {o.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* ── Scan ── */}
                        <section>
                            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-3 mb-3">
                                Scan
                            </p>
                            <div className="flex flex-col gap-1.5">
                                <Toggle
                                    checked={devOptions.simulateRateLimit}
                                    onChange={(v) => update({ simulateRateLimit: v })}
                                    label="Simulate rate limit"
                                    description="Fires a 10s 429 countdown after the first article"
                                />
                            </div>
                        </section>

                        {/* ── Shortcuts ── */}
                        <section>
                            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-3 mb-3">
                                Jump to state
                            </p>
                            <div className="flex flex-col gap-1.5">
                                <button
                                    onClick={() => { onJumpToScanning(); onClose(); }}
                                    className="w-full flex items-center justify-between px-3 py-2.5 bg-bg-3 border border-line-2 rounded-md text-[12px] font-semibold text-ink-2 hover:text-ink-1 hover:bg-bg-4 cursor-pointer transition-all duration-[180ms] group"
                                >
                                    <span>Jump to scanning</span>
                                    <svg className="w-3.5 h-3.5 text-ink-3 group-hover:text-ink-1 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => { onJumpToComplete(); onClose(); }}
                                    className="w-full flex items-center justify-between px-3 py-2.5 bg-bg-3 border border-line-2 rounded-md text-[12px] font-semibold text-ink-2 hover:text-ink-1 hover:bg-bg-4 cursor-pointer transition-all duration-[180ms] group"
                                >
                                    <span>Jump to complete</span>
                                    <svg className="w-3.5 h-3.5 text-ink-3 group-hover:text-ink-1 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Footer */}
                    <footer className="px-4 py-3 border-t border-line-1 flex-shrink-0 bg-bg-1/30 flex items-center justify-between">
                        <p className="font-mono text-[10px] font-semibold tracking-[0.06em] text-ink-3">
                            Only visible in dev builds
                        </p>
                        <button
                            onClick={reset}
                            className="font-mono text-[10px] font-semibold text-ink-3 hover:text-ink-1 cursor-pointer transition-colors duration-[180ms]"
                        >
                            Reset all
                        </button>
                    </footer>
                </div>
            </div>
        </>
    );
}
