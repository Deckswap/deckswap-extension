// src/popup/states/StateDetect.tsx

import type { ReactNode } from 'react';
import { Button } from '../components/Button';
import { ArrowRightIcon } from '../icons';

type DetectStatus = 'checking' | 'not-logged-in' | 'fetch-error' | 'rate-limited' | 'no-cm-tab' | 'no-articles' | 'no-permission' | 'detected';

type StateDetectBaseProps = {
    onGoToCardmarket?: () => void;
};

type StateDetectProps = StateDetectBaseProps & {
    status: DetectStatus;
    articleCount?: number | null;
    interrupted?: boolean;
    autoOpenCmTab?: boolean;
};

export function StateDetect({ status, articleCount, onGoToCardmarket, interrupted, autoOpenCmTab }: StateDetectProps) {
    if (status === 'checking') {
        return (
            <div className="text-center py-6">
                <span
                    aria-hidden
                    className="inline-block w-5 h-5 rounded-full border-2 border-bg-4 border-t-blue animate-spin mb-4"
                />
                <p className="text-[13px] text-ink-3">Checking your Cardmarket stock…</p>
            </div>
        );
    }

    let body: ReactNode;

    if (status === 'no-cm-tab') {
        body = (
            <div className="text-center py-2">
                <span className="block font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-3 mb-3">
                    No Cardmarket tab found
                </span>
                <h2 className="text-[20px] font-bold tracking-[-0.02em] leading-[1.2] text-ink-1 mb-2">
                    {autoOpenCmTab ? 'Something went wrong' : 'Open Cardmarket first'}
                </h2>
                <p className="text-[13px] leading-[1.6] text-ink-3 max-w-[280px] mx-auto">
                    {autoOpenCmTab
                        ? 'We tried to open Cardmarket automatically but failed. Try again or open it manually.'
                        : 'Open Cardmarket in a tab, then click Try again.'}
                </p>
            </div>
        );
    } else if (status === 'not-logged-in') {
        body = (
            <div className="text-center py-2">
                <span className="block font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-3 mb-3">
                    Not signed in to Cardmarket
                </span>
                <h2 className="text-[20px] font-bold tracking-[-0.02em] leading-[1.2] text-ink-1 mb-2">
                    Log in to Cardmarket first
                </h2>
                <p className="text-[13px] leading-[1.6] text-ink-3 max-w-[280px] mx-auto">
                    Sign in to your Cardmarket account, then come back and click Try again.
                </p>
                {onGoToCardmarket && (
                    <button
                        onClick={onGoToCardmarket}
                        className="mt-3 text-[12px] font-semibold text-blue hover:text-blue-link transition-colors cursor-pointer"
                    >
                        Go to Cardmarket →
                    </button>
                )}
            </div>
        );
    } else if (status === 'no-articles') {
        body = (
            <div className="text-center py-2">
                <span className="block font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-3 mb-3">
                    Nothing to import
                </span>
                <h2 className="text-[20px] font-bold tracking-[-0.02em] leading-[1.2] text-ink-1 mb-2">
                    No Pokémon Singles found
                </h2>
                <p className="text-[13px] leading-[1.6] text-ink-3 max-w-[280px] mx-auto">
                    Your Cardmarket stock doesn't appear to have any Pokémon Singles listed. Add some listings and try again.
                </p>
            </div>
        );
    } else if (status === 'rate-limited') {
        body = (
            <div className="text-center py-2">
                <span className="block font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-orange mb-3">
                    Rate limited by Cardmarket
                </span>
                <h2 className="text-[20px] font-bold tracking-[-0.02em] leading-[1.2] text-ink-1 mb-2">
                    Too many requests
                </h2>
                <p className="text-[13px] leading-[1.6] text-ink-3 max-w-[280px] mx-auto">
                    Cardmarket is throttling requests. Wait a minute, then click Try again.
                </p>
            </div>
        );
    } else if (status === 'no-permission') {
        body = (
            <div className="text-center py-2">
                <span className="block font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-orange mb-3">
                    Site access disabled
                </span>
                <h2 className="text-[20px] font-bold tracking-[-0.02em] leading-[1.2] text-ink-1 mb-2">
                    Cardmarket access blocked
                </h2>
                <p className="text-[13px] leading-[1.6] text-ink-3 max-w-[280px] mx-auto">
                    Go to <strong className="text-ink-2">chrome://extensions</strong>, find Deckswap Importer, and re-enable access to <strong className="text-ink-2">cardmarket.com</strong>.
                </p>
            </div>
        );
    } else if (status === 'fetch-error') {
        body = (
            <div className="text-center py-2">
                <span className="block font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-3 mb-3">
                    Could not reach Cardmarket
                </span>
                <h2 className="text-[20px] font-bold tracking-[-0.02em] leading-[1.2] text-ink-1 mb-2">
                    Connection failed
                </h2>
                <p className="text-[13px] leading-[1.6] text-ink-3 max-w-[280px] mx-auto">
                    Check your internet connection and try again.
                </p>
            </div>
        );
    } else {
        // detected
        const countLabel = articleCount == null ? '—' : articleCount.toLocaleString('en');
        body = (
            <div className="py-2">
                {interrupted && (
                    <div className="flex items-start gap-2.5 px-3 py-2.5 bg-orange-bg border border-orange-border rounded-md mb-4">
                        <svg
                            aria-hidden
                            className="w-3.5 h-3.5 text-orange flex-shrink-0 mt-px"
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
                        <p className="text-[12px] text-orange leading-[1.5]">
                            Scan interrupted — the Cardmarket tab was closed. Your progress was saved and you can resume below.
                        </p>
                    </div>
                )}
                <div className="text-center">
                    {articleCount === 0 ? (
                        <>
                            <span className="block font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-3 mb-3">
                                Nothing to import
                            </span>
                            <h2 className="text-[22px] font-bold tracking-[-0.02em] leading-[1.2] text-ink-1 mb-2">
                                No articles found
                            </h2>
                            <p className="text-[13px] leading-[1.6] text-ink-3 max-w-[280px] mx-auto">
                                You don't have any Pokémon Singles listed on Cardmarket. Add some listings and try again.
                            </p>
                        </>
                    ) : (
                        <>
                            <span className="block font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-green mb-3">
                                Pokémon stock detected
                            </span>
                            <h2 className="text-[22px] font-bold tracking-[-0.02em] leading-[1.2] text-ink-1 mb-2">
                                {countLabel} articles ready
                            </h2>
                            <p className="text-[13px] leading-[1.6] text-ink-3 max-w-[280px] mx-auto">
                                We'll import everything as drafts on Deckswap. Nothing goes live until you review it.
                            </p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return <>{body}</>;
}

export function StateDetectFooter({
    onStart,
    onResume,
    onRetry,
    detectStatus,
    checkpoint,
    articleCount,
}: StateDetectBaseProps & {
    onStart?: () => void;
    onResume?: () => void;
    onRetry?: () => void;
    detectStatus: DetectStatus;
    checkpoint?: { page: number; totalPages: number | null; articleCount: number } | null;
    articleCount?: number | null;
}) {
    const isError = detectStatus !== 'detected' && detectStatus !== 'checking';

    if (isError) {
        return (
            <Button block onClick={onRetry}>
                Try again
            </Button>
        );
    }

    if (detectStatus === 'detected' && checkpoint) {
        const pageLabel = checkpoint.totalPages
            ? `page ${checkpoint.page} of ${checkpoint.totalPages}`
            : `page ${checkpoint.page}`;
        return (
            <>
                <Button block onClick={onResume}>
                    Resume scan ({pageLabel})
                    <ArrowRightIcon />
                </Button>
                <Button variant="ghost" onClick={onStart}>
                    Start fresh
                </Button>
            </>
        );
    }

    return (
        <Button block onClick={onStart} disabled={detectStatus !== 'detected' || articleCount === 0}>
            Start import
            <ArrowRightIcon />
        </Button>
    );
}
