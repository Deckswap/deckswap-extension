// src/popup/components/FAQ.tsx

import { useState } from 'react';

const ITEMS = [
    {
        q: 'Why does the scan take a while?',
        a: 'Deckswap reads your Cardmarket stock page by page with a short delay between each request to avoid being rate-limited. A large collection can take a few minutes.',
    },
    {
        q: 'Will my listings go live immediately?',
        a: 'No — everything is imported as drafts on Deckswap. Nothing goes live until you review and publish it yourself.',
    },
    {
        q: 'What if the scan is interrupted?',
        a: 'Your progress is saved after every page. If the scan stops early, just reopen the panel and click Resume scan to pick up where you left off.',
    },
    {
        q: 'Which listings does Deckswap import?',
        a: 'Only Pokémon Singles from your Cardmarket stock. Other categories (sealed product, accessories, etc.) are not imported.',
    },
];

export function FAQ() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <div className="mt-4">
            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-3 mb-2">
                FAQ
            </p>
            <div className="border border-line-2 rounded-lg overflow-hidden">
                {ITEMS.map((item, i) => {
                    const isOpen = open === i;
                    return (
                        <div key={i} className={i > 0 ? 'border-t border-line-1' : ''}>
                            <button
                                type="button"
                                onClick={() => setOpen(isOpen ? null : i)}
                                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer hover:bg-bg-3 transition-colors duration-[180ms]"
                            >
                                <span className="text-[12px] font-semibold text-ink-1 leading-[1.4]">
                                    {item.q}
                                </span>
                                <svg
                                    className={[
                                        'w-3.5 h-3.5 text-ink-3 flex-shrink-0 transition-transform duration-[180ms]',
                                        isOpen ? 'rotate-180' : '',
                                    ].join(' ')}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                            {isOpen && (
                                <p className="px-4 pb-3 text-[12px] leading-[1.6] text-ink-3">
                                    {item.a}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
