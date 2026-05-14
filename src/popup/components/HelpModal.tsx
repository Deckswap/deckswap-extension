// src/popup/components/HelpModal.tsx

import { useEffect } from 'react';

type FAQ = {
    q: string;
    a: string;
};

const faqs: FAQ[] = [
    {
        q: 'What does this tool do?',
        a: 'This extension reads your Cardmarket Pokémon Singles stock and stages every listing as a draft on your Deckswap shop. Nothing goes live until you review and publish each one yourself.',
    },
    {
        q: 'What does Deckswap see?',
        a: 'Only the stock data already visible on your public Cardmarket profile — cards, conditions, prices, quantities. Your Cardmarket password is never asked for, seen or stored. The extension uses your own browser session, exactly as if you were clicking through your stock yourself.',
    },
    {
        q: 'How long does it take?',
        a: 'Around 3 minutes for 1,000 cards, about an hour for 20,000. The extension opens Cardmarket automatically if needed — just don\'t close that tab or navigate it away from Cardmarket while the scan is running.',
    },
    {
        q: 'What if I cancel or close the popup midway?',
        a: 'Your progress is saved automatically after each page. Next time you open the extension, you\'ll see a "Resume scan" option that picks up exactly where you left off — no need to start over.',
    },
    {
        q: 'What if I see a rate limit countdown?',
        a: 'Cardmarket occasionally throttles requests. The extension detects this automatically, waits a few seconds, and retries — no action needed from you. Just leave it running.',
    },
    {
        q: 'Which listings are included?',
        a: 'Only Pokémon Singles. Sealed product, accessories, and other categories are not scanned in this version.',
    },
];

type HelpModalProps = {
    open: boolean;
    onClose: () => void;
};

export function HelpModal({ open, onClose }: HelpModalProps) {
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <>
            {/* Dimmer + blur overlay */}
            <button
                aria-label="Close help"
                onClick={onClose}
                className="fixed inset-0 z-40 bg-bg-1/70 backdrop-blur-sm cursor-default"
            />

            {/* Floating modal */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Help"
                className="fixed inset-0 z-50 m-3 bg-bg-2 border border-line-2 rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-none"
            >
                <div className="flex flex-col h-full pointer-events-auto">
                    {/* Header */}
                    <header className="flex items-center px-4 py-3 border-b border-line-1 flex-shrink-0">
                        <h2 className="text-[15px] font-bold tracking-[-0.02em] text-ink-1">
                            Help
                        </h2>
                        <button
                            onClick={onClose}
                            aria-label="Close help"
                            className="ml-auto w-7 h-7 rounded-sm flex items-center justify-center text-ink-3 hover:text-ink-1 cursor-pointer hover:bg-bg-3 transition-all duration-[180ms]"
                        >
                            <svg
                                width={16}
                                height={16}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </header>

                    {/* FAQ body */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
                        <ul className="flex flex-col gap-[18px]">
                            {faqs.map((faq, i) => (
                                <li key={i}>
                                    <div className="text-[13px] font-semibold text-ink-1 tracking-[-0.01em] mb-1.5">
                                        {faq.q}
                                    </div>
                                    <p className="text-[12px] leading-[1.6] text-ink-3">
                                        {faq.a}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Footer */}
                    <footer className="px-4 py-3 border-t border-line-1 flex-shrink-0 bg-bg-1/30">
                        <p className="font-mono text-[10px] font-semibold tracking-[0.06em] text-ink-3 text-center">
                            More questions?{' '}
                            <a
                                href="mailto:support@deckswap.com"
                                className="text-blue hover:text-blue-link transition-colors"
                            >
                                support@deckswap.com
                            </a>
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
}
