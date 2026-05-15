// src/popup/states/StateComplete.tsx

import { useEffect, useState } from 'react';
import type { ImportCardmarketResult } from '../../lib/api';
import type { ScannedArticle } from '../../lib/types';
import { Button } from '../components/Button';
import { StepStrip } from '../components/StepStrip';
import { CheckIcon, ChevronDownIcon, UploadIcon } from '../icons';

type Props = {
    articles: ScannedArticle[];
    elapsedSeconds: number;
    savedAt?: number | null;
    importResult?: ImportCardmarketResult | null;
};

function formatEur(value: number): string {
    if (value >= 1_000_000) {
        return `€${(value / 1_000_000).toLocaleString('en', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}M`;
    }
    if (value >= 10_000) {
        return `€${(value / 1_000).toLocaleString('en', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}K`;
    }
    return `€${value.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m} minutes ${s} seconds` : `${s} seconds`;
}

function useRelativeTime(ts: number | null | undefined): string | null {
    const [label, setLabel] = useState<string | null>(null);

    useEffect(() => {
        if (!ts) { setLabel(null); return; }

        const update = () => {
            const diff = Math.floor((Date.now() - ts) / 1000);
            if (diff < 60) setLabel('just now');
            else if (diff < 3600) setLabel(`${Math.floor(diff / 60)} minutes ago`);
            else if (diff < 86400) setLabel(`${Math.floor(diff / 3600)} hours ago`);
            else setLabel(`${Math.floor(diff / 86400)} days ago`);
        };

        update();
        const id = setInterval(update, 30_000);
        return () => clearInterval(id);
    }, [ts]);

    return label;
}

export function StateComplete({ articles, elapsedSeconds, savedAt, importResult }: Props) {
    const relativeTime = useRelativeTime(savedAt);
    const showAge = relativeTime !== null && relativeTime !== 'just now';
    const totalValue = articles.reduce(
        (sum, a) => sum + a.price * a.quantity,
        0,
    );
    const [unmatchedOpen, setUnmatchedOpen] = useState(false);

    return (
        <>
            <StepStrip
                steps={[
                    { label: 'Detect', state: 'done' },
                    { label: 'Scan', state: 'done' },
                    { label: 'Push', state: 'active' },
                ]}
            />

            {/* Success hero */}
            <div className="relative bg-green-bg border border-green-border rounded-lg px-[18px] py-[22px] mb-3.5 text-center overflow-hidden animate-scale-in">
                <div
                    aria-hidden
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            'radial-gradient(ellipse 300px 180px at 50% 0%, rgba(34,200,122,0.18) 0%, transparent 70%)',
                    }}
                />
                <div className="relative">
                    <div
                        className="w-11 h-11 rounded-full bg-green flex items-center justify-center mx-auto mb-3"
                        style={{ boxShadow: '0 0 30px rgba(34,200,122,0.5)' }}
                    >
                        <CheckIcon size={24} className="text-bg-1" />
                    </div>
                    <div className="text-[18px] font-bold tracking-[-0.02em] text-ink-1 mb-1">
                        All done — {formatTime(elapsedSeconds)}
                    </div>
                    <div className="font-mono text-[11px] font-semibold text-green tracking-[0.06em]">
                        {articles.length.toLocaleString('en')} ARTICLES SCANNED
                    </div>
                    {showAge && (
                        <div className="font-mono text-[10px] font-semibold text-ink-3 tracking-[0.04em] mt-1.5">
                            Scanned {relativeTime}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats grid — pre-push shows scanned + value; post-push shows imported + unmatched */}
            {importResult ? (
                <div className="grid grid-cols-2 gap-1.5 animate-fade-up">
                    <Stat value={importResult.imported.toLocaleString('en')} tone="green" label="Imported" />
                    <Stat value={importResult.updated.toLocaleString('en')} label="Updated" />
                    <Stat value={importResult.deleted.toLocaleString('en')} tone={importResult.deleted > 0 ? 'red' : undefined} label="Removed" />
                    <Stat value={importResult.unmatched.toLocaleString('en')} tone={importResult.unmatched > 0 ? 'red' : undefined} label="Unmatched" />
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-1.5">
                    <Stat
                        value={articles.length.toLocaleString('en')}
                        tone="green"
                        label="Articles"
                        className="animate-fade-up [animation-delay:0.1s]"
                    />
                    <Stat
                        value={formatEur(totalValue)}
                        tone="gold"
                        label="Total value"
                        className="animate-fade-up [animation-delay:0.18s]"
                    />
                </div>
            )}

            {/* Unmatched details */}
            {importResult && importResult.unmatched > 0 && (
                <div className="mt-2 border border-line-2 rounded-md overflow-hidden animate-fade-up [animation-delay:0.08s]">
                    <button
                        className="w-full flex items-center justify-between px-3 py-2.5 text-left cursor-pointer bg-bg-2 hover:bg-bg-3 transition-colors"
                        onClick={() => setUnmatchedOpen((o) => !o)}
                    >
                        <span className="text-[12px] font-semibold text-ink-2">
                            {importResult.unmatched} unmatched article{importResult.unmatched !== 1 ? 's' : ''}
                        </span>
                        <ChevronDownIcon
                            size={14}
                            className={[
                                'text-ink-3 transition-transform duration-200',
                                unmatchedOpen ? 'rotate-180' : '',
                            ].join(' ')}
                        />
                    </button>
                    <div
                        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
                        style={{ gridTemplateRows: unmatchedOpen ? '1fr' : '0fr' }}
                    >
                        <div className="overflow-hidden">
                            <ul className="px-3 py-2 space-y-2">
                                {importResult.unmatchedArticles.map((a, i) => (
                                    <li key={i} className="flex flex-col gap-0.5">
                                        <span className="text-[11px] font-semibold text-ink-2 truncate">{a.name}</span>
                                        <span className="text-[10px] text-ink-3">{a.reason}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/* ─── STAT ────────────────────────────────────────── */

function Stat({
    value,
    label,
    tone,
    className,
}: {
    value: string;
    label: string;
    tone?: 'green' | 'gold' | 'red';
    className?: string;
}) {
    const toneClass =
        tone === 'green' ? 'text-green' : tone === 'gold' ? 'text-gold' : tone === 'red' ? 'text-red' : 'text-ink-1';

    return (
        <div className={['p-3 bg-bg-2 border border-line-2 rounded-md', className].filter(Boolean).join(' ')}>
            <div
                className={[
                    'font-mono text-[18px] font-semibold leading-none mb-1 tracking-[-0.01em]',
                    toneClass,
                ].join(' ')}
            >
                {value}
            </div>
            <div className="font-mono text-[9px] font-semibold tracking-[0.10em] uppercase text-ink-3">
                {label}
            </div>
        </div>
    );
}

/* ─── FOOTER ──────────────────────────────────────── */

import type { ImportMode, LatestBatchResult } from '../../lib/api';

const MODE_CONFIG: Record<
    ImportMode,
    { label: string; description: (batch: LatestBatchResult | null, articleCount: number) => string }
> = {
    SYNC: {
        label: 'Sync',
        description: (batch, _count) =>
            batch
                ? `Updates your ${batch.draft} existing draft${batch.draft !== 1 ? 's' : ''} with new prices & quantities, removes any no longer on Cardmarket, and creates new ones. Active listings are never touched.`
                : `Keeps your Deckswap drafts in sync with your Cardmarket stock. Removes drafts no longer on Cardmarket. Active listings are never touched.`,
    },
    ADD: {
        label: 'Add',
        description: (batch, count) =>
            batch
                ? `Creates ${count} new drafts alongside your existing ${batch.draft} draft${batch.draft !== 1 ? 's' : ''}. Nothing is removed or updated.`
                : `Creates ${count} new draft listings. Nothing is removed or updated.`,
    },
};

export function StateCompleteFooter({
    onPush,
    onScanAgain,
    articleCount,
    pushState = 'idle',
    mode = 'ADD',
    onModeChange,
    latestBatch,
}: {
    onPush?: () => void;
    onScanAgain?: () => void;
    articleCount: number;
    pushState?: 'idle' | 'pushing' | 'pushed' | 'error';
    mode?: ImportMode;
    onModeChange?: (mode: ImportMode) => void;
    latestBatch?: LatestBatchResult | null | 'loading';
}) {
    const [confirmScan, setConfirmScan] = useState(false);
    const pushing = pushState === 'pushing';
    const pushed = pushState === 'pushed';
    const hasBatch = latestBatch && latestBatch !== 'loading';
    const lastSyncedAt = hasBatch ? new Date(latestBatch.importedAt).getTime() : null;
    const lastSyncedLabel = useRelativeTime(lastSyncedAt);

    const handleScanAgainClick = () => {
        if (!confirmScan) { setConfirmScan(true); return; }
        setConfirmScan(false);
        onScanAgain?.();
    };

    return (
        <>
            {/* Stock overview */}
            {hasBatch && !pushed && (
                <div className="mb-3 p-3 bg-bg-2 border border-line-2 rounded-md animate-fade-up">
                    <div className="flex items-baseline justify-between mb-2">
                        <span className="font-mono text-[9px] font-semibold tracking-[0.10em] uppercase text-ink-3">
                            Imported stock
                        </span>
                        {lastSyncedLabel && (
                            <span className="font-mono text-[9px] text-ink-3">
                                Last synced {lastSyncedLabel}
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                        <MiniStat value={latestBatch.draft} label="Draft" tone="default" />
                        <MiniStat value={latestBatch.active} label="Active" tone="green" />
                        <MiniStat value={latestBatch.soldOut} label="Sold" tone="gold" />
                        <MiniStat value={latestBatch.deleted} label="Removed" tone="muted" />
                    </div>
                </div>
            )}

            {/* Mode selector — only show before push */}
            {!pushed && (
                <div className="mb-3 animate-fade-up [animation-delay:0.05s]">
                    <div className="font-mono text-[9px] font-semibold tracking-[0.10em] uppercase text-ink-3 mb-2">
                        Mode
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                        {(Object.keys(MODE_CONFIG) as ImportMode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => onModeChange?.(m)}
                                className={[
                                    'py-2 rounded-md border text-[11px] font-semibold cursor-pointer transition-colors',
                                    mode === m
                                        ? 'bg-blue border-blue text-white'
                                        : 'bg-bg-2 border-line-2 text-ink-2 hover:border-line-1',
                                ].join(' ')}
                            >
                                {MODE_CONFIG[m].label}
                            </button>
                        ))}
                    </div>
                    {latestBatch !== 'loading' && (
                        <p className="text-[11px] text-ink-3 leading-[1.5]">
                            {MODE_CONFIG[mode].description(hasBatch ? latestBatch : null, articleCount)}
                        </p>
                    )}
                </div>
            )}

            <Button block onClick={onPush} disabled={pushing || pushed}>
                <UploadIcon />
                {pushing
                    ? (mode === 'SYNC' ? 'Syncing…' : 'Pushing…')
                    : pushed
                      ? `${articleCount.toLocaleString('en')} articles ${mode === 'SYNC' ? 'synced' : 'pushed'}`
                      : pushState === 'error'
                        ? `${mode === 'SYNC' ? 'Sync' : 'Push'} failed — try again`
                        : mode === 'SYNC'
                          ? `Sync ${articleCount.toLocaleString('en')} articles with Deckswap`
                          : `Push ${articleCount.toLocaleString('en')} articles to Deckswap`}
            </Button>
            {pushed && (
                <Button
                    block
                    variant="ghost"
                    onClick={() => window.open(`${import.meta.env.VITE_DECKSWAP_APP_URL}/listings?status=draft`, '_blank')}
                >
                    View drafts on Deckswap
                </Button>
            )}
            <Button
                variant={confirmScan ? 'destructive-ghost' : 'ghost'}
                onClick={handleScanAgainClick}
                onBlur={() => setConfirmScan(false)}
            >
                {confirmScan ? 'This will clear your scan — confirm?' : 'Scan again'}
            </Button>
        </>
    );
}

/* ─── MINI STAT ───────────────────────────────────── */

function MiniStat({
    value,
    label,
    tone,
}: {
    value: number;
    label: string;
    tone: 'default' | 'green' | 'gold' | 'muted';
}) {
    const valueClass =
        tone === 'green' ? 'text-green' :
        tone === 'gold' ? 'text-gold' :
        tone === 'muted' ? 'text-ink-3' :
        'text-ink-1';

    return (
        <div className="flex flex-col items-center p-1.5 bg-bg-3 rounded">
            <span className={['font-mono text-[13px] font-semibold leading-none', valueClass].join(' ')}>
                {value}
            </span>
            <span className="font-mono text-[8px] font-semibold tracking-[0.08em] uppercase text-ink-3 mt-0.5">
                {label}
            </span>
        </div>
    );
}
