// src/popup/states/StateComplete.tsx

import { useEffect, useState } from 'react';
import type { ScannedArticle } from '../../lib/types';
import { Button } from '../components/Button';
import { StepStrip } from '../components/StepStrip';
import { CheckIcon, UploadIcon } from '../icons';

type Props = {
    articles: ScannedArticle[];
    elapsedSeconds: number;
    savedAt?: number | null;
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

export function StateComplete({ articles, elapsedSeconds, savedAt }: Props) {
    const relativeTime = useRelativeTime(savedAt);
    const showAge = relativeTime !== null && relativeTime !== 'just now';
    const totalValue = articles.reduce(
        (sum, a) => sum + a.price * a.quantity,
        0,
    );

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
            <div className="relative bg-green-bg border border-green-border rounded-lg px-[18px] py-[22px] mb-3.5 text-center overflow-hidden">
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

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-1.5">
                <Stat
                    value={articles.length.toLocaleString('en')}
                    tone="green"
                    label="Articles"
                />
                <Stat
                    value={formatEur(totalValue)}
                    tone="gold"
                    label="Total value"
                />
            </div>
        </>
    );
}

/* ─── STAT ────────────────────────────────────────── */

function Stat({
    value,
    label,
    tone,
}: {
    value: string;
    label: string;
    tone?: 'green' | 'gold';
}) {
    const toneClass =
        tone === 'green' ? 'text-green' : tone === 'gold' ? 'text-gold' : 'text-ink-1';

    return (
        <div className="p-3 bg-bg-2 border border-line-2 rounded-md">
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

export function StateCompleteFooter({
    onPush,
    onScanAgain,
    articleCount,
    pushState = 'idle',
}: {
    onPush?: () => void;
    onScanAgain?: () => void;
    articleCount: number;
    pushState?: 'idle' | 'pushing' | 'pushed' | 'error';
}) {
    const [confirmScan, setConfirmScan] = useState(false);
    const pushing = pushState === 'pushing';
    const pushed = pushState === 'pushed';

    const handleScanAgainClick = () => {
        if (!confirmScan) { setConfirmScan(true); return; }
        setConfirmScan(false);
        onScanAgain?.();
    };

    return (
        <>
            <Button block onClick={onPush} disabled={pushing || pushed}>
                <UploadIcon />
                {pushing
                    ? 'Pushing…'
                    : pushed
                      ? `${articleCount.toLocaleString('en')} articles pushed`
                      : pushState === 'error'
                        ? 'Push failed — try again'
                        : `Push ${articleCount.toLocaleString('en')} articles to Deckswap`}
            </Button>
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
