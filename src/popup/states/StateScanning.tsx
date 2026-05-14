// src/popup/states/StateScanning.tsx

import { useEffect, useState } from 'react';
import type { ScanProgress } from '../../lib/types';
import { Button } from '../components/Button';
import { StepStrip } from '../components/StepStrip';

type Props = {
    progress: ScanProgress | null;
    startTime: number;
    rateLimitSeconds: number;
};

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function conditionTone(cond: string): 'green' | 'gold' | 'orange' {
    const u = cond.toUpperCase();
    if (u === 'M' || u === 'MT' || u === 'NM') return 'green';
    if (u === 'EX' || u === 'GD') return 'gold';
    return 'orange';
}

export function StateScanning({ progress, startTime, rateLimitSeconds }: Props) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const id = setInterval(
            () => setElapsed(Math.floor((Date.now() - startTime) / 1000)),
            1000,
        );
        return () => clearInterval(id);
    }, [startTime]);

    const scanned = progress?.scanned ?? 0;
    const total = progress?.total ?? null;
    const pct =
        total && total > 0 ? Math.min(100, Math.round((scanned / total) * 100)) : null;
    const eta =
        elapsed > 0 && scanned > 0 && total && total > scanned
            ? Math.round((elapsed / scanned) * (total - scanned))
            : null;

    return (
        <>
            <StepStrip
                steps={[
                    { label: 'Detect', state: 'done' },
                    { label: 'Scan', state: 'active' },
                    { label: 'Push', state: 'pending' },
                ]}
            />

            <span className="block font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-blue mb-1.5">
                Scanning · Step 2 of 3
            </span>
            <h2 className="text-[20px] font-bold tracking-[-0.02em] leading-[1.25] text-ink-1 mb-1.5">
                Reading your Cardmarket stock
            </h2>
            <p className="text-[13px] leading-[1.6] text-ink-3 mb-[18px]">
                Keep this side panel open while scanning.
            </p>

            {/* Progress hero */}
            <div className="relative bg-bg-2 border border-line-2 rounded-lg p-4 mb-3.5 overflow-hidden">
                <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none animate-[scan-shimmer_2.4s_linear_infinite]"
                    style={{
                        background:
                            'linear-gradient(90deg, transparent, rgba(45,107,228,0.06), transparent)',
                        backgroundSize: '200% 100%',
                    }}
                />

                <div className="relative">
                    <div className="flex items-baseline justify-between mb-3">
                        <div className="flex items-baseline gap-1.5">
                            <span className="font-mono text-[28px] font-semibold text-ink-1 tracking-[-0.02em] leading-none">
                                {scanned.toLocaleString('en')}
                            </span>
                            {total != null && (
                                <>
                                    <span className="font-mono text-[18px] font-medium text-ink-3 leading-none">
                                        /
                                    </span>
                                    <span className="font-mono text-[16px] font-medium text-ink-2 leading-none">
                                        {total.toLocaleString('en')}
                                    </span>
                                </>
                            )}
                        </div>
                        {pct != null && (
                            <span className="font-mono text-[13px] font-semibold text-blue px-2.5 py-1 bg-blue-bg border border-blue-border rounded-full">
                                {pct}%
                            </span>
                        )}
                    </div>

                    <div
                        role="progressbar"
                        aria-valuenow={pct ?? 0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Scan progress"
                        className="relative h-1.5 bg-bg-4 rounded-full overflow-hidden mb-3"
                    >
                        <div
                            className="h-full rounded-full transition-[width] duration-500"
                            style={{
                                width: pct != null ? `${pct}%` : '30%',
                                background:
                                    'linear-gradient(90deg, var(--color-blue-dark) 0%, var(--color-blue) 100%)',
                                boxShadow: '0 0 10px rgba(45,107,228,0.4)',
                            }}
                        />
                    </div>

                    <div className="flex gap-3.5 font-mono text-[10px] font-semibold text-ink-3 tracking-[0.06em]">
                        <span>
                            Elapsed{' '}
                            <strong className="text-ink-1 font-semibold">
                                {formatTime(elapsed)}
                            </strong>
                        </span>
                        {eta != null && (
                            <>
                                <span className="w-[3px] h-[3px] rounded-full bg-ink-3 self-center" />
                                <span>
                                    ETA{' '}
                                    <strong className="text-ink-1 font-semibold">
                                        ~{formatTime(eta)}
                                    </strong>
                                </span>
                            </>
                        )}
                        {progress?.totalPages != null && (
                            <>
                                <span className="w-[3px] h-[3px] rounded-full bg-ink-3 self-center" />
                                <span>
                                    <strong className="text-ink-1 font-semibold">
                                        {progress.page}
                                    </strong>
                                    /{progress.totalPages} pages
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Currently scanning / rate limit warning */}
            {rateLimitSeconds > 0 ? (
                <div className="flex items-center gap-2.5 px-3 py-2.5 bg-orange-bg border border-orange-border rounded-md mb-3.5">
                    <svg
                        aria-hidden
                        className="w-3.5 h-3.5 text-orange flex-shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span className="text-xs text-orange font-medium flex-1 min-w-0">
                        Rate limited by Cardmarket —{' '}
                        <strong className="font-semibold">
                            retrying in {rateLimitSeconds}s
                        </strong>
                    </span>
                </div>
            ) : (
                <div className="flex items-center gap-2.5 px-3 py-2.5 bg-bg-3 border border-line-2 rounded-md mb-3.5">
                    <span
                        aria-hidden
                        className="w-3.5 h-3.5 rounded-full border-[1.5px] border-bg-4 border-t-blue animate-spin flex-shrink-0"
                    />
                    <span className="text-xs text-ink-2 font-medium flex-1 min-w-0 truncate">
                        {progress?.totalPages != null ? (
                            <>
                                Reading{' '}
                                <strong className="text-ink-1 font-semibold">
                                    page {progress.page} of {progress.totalPages}
                                </strong>
                            </>
                        ) : (
                            'Starting scan…'
                        )}
                    </span>
                </div>
            )}

            {/* Live ticker */}
            {progress?.recent && progress.recent.length > 0 && (
                <>
                    <div className="flex items-center gap-1.5 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green animate-[pulse-soft_1.4s_ease-in-out_infinite]" />
                        <span className="font-mono text-[10px] font-semibold tracking-[0.10em] uppercase text-ink-3">
                            Recently scanned
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        {progress.recent.map((item, i) => {
                            const tone = conditionTone(item.condition);
                            return (
                                <div
                                    key={i}
                                    className="flex items-center gap-2 px-2.5 py-1.5 bg-bg-2 border border-line-1 rounded-md"
                                    style={{ opacity: 1 - i * 0.25 }}
                                >
                                    <span className="w-[18px] h-6 rounded-sm bg-gradient-to-br from-bg-4 to-bg-5 border border-line-2 flex-shrink-0" />
                                    <span className="text-[11px] font-medium text-ink-1 flex-1 min-w-0 truncate">
                                        {item.name}
                                    </span>
                                    {item.reverseHolo && (
                                        <span className="font-mono text-[9px] font-semibold px-1.5 rounded-sm border flex-shrink-0 bg-blue-bg text-blue border-blue-border">
                                            RH
                                        </span>
                                    )}
                                    <span className="font-mono text-[9px] font-semibold text-ink-3 flex-shrink-0">
                                        {item.language.slice(0, 2).toUpperCase()}
                                    </span>
                                    <span
                                        className={[
                                            'font-mono text-[9px] font-semibold px-1.5 rounded-sm border flex-shrink-0',
                                            tone === 'green'
                                                ? 'bg-green-bg text-green border-green-border'
                                                : tone === 'gold'
                                                  ? 'bg-gold-bg text-gold border-gold-border'
                                                  : 'bg-orange-bg text-orange border-orange-border',
                                        ].join(' ')}
                                    >
                                        {item.condition}
                                    </span>
                                    <span className="font-mono text-[10px] font-semibold text-gold flex-shrink-0">
                                        €{item.price.toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </>
    );
}

/* ─── FOOTER ──────────────────────────────────────── */

export function StateScanningFooter({
    onCancel,
    scanned,
}: {
    onCancel?: () => void;
    scanned: number;
}) {
    return (
        <>
            <span className="font-mono text-[11px] font-semibold text-ink-3 tracking-[0.04em] leading-[1.3] mr-auto">
                <strong className="text-ink-1 font-semibold">
                    {scanned.toLocaleString('en')}
                </strong>{' '}
                scanned
            </span>
            <Button variant="destructive-ghost" onClick={onCancel}>
                Cancel
            </Button>
        </>
    );
}
