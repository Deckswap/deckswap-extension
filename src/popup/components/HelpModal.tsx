// src/popup/components/HelpModal.tsx

import { useEffect, useState } from 'react';

type Item = { q: string; a: string };
type Section = { title: string; items: Item[] };

const SECTIONS: Section[] = [
    {
        title: 'Getting started',
        items: [
            {
                q: 'What does this extension do?',
                a: 'Deckswap Importer reads your Cardmarket Pokémon Singles stock and stages every listing as a draft on your Deckswap shop. Nothing goes live until you review and publish each one yourself.',
            },
            {
                q: 'What account do I sign in with?',
                a: 'Your Deckswap account — the same email and password you use on deckswap.com. Your Cardmarket credentials are never asked for, seen, or stored.',
            },
            {
                q: 'Do I need to be logged in to Cardmarket?',
                a: 'Yes. The extension reads your stock using your existing browser session on Cardmarket. Open Cardmarket in a tab, sign in there, then come back to the extension.',
            },
            {
                q: 'What data does Deckswap see?',
                a: 'Only the stock data already visible on your public Cardmarket profile — card names, expansions, conditions, languages, prices, and quantities. Nothing else is accessed.',
            },
        ],
    },
    {
        title: 'Detection errors',
        items: [
            {
                q: '"No Cardmarket tab found"',
                a: 'The extension couldn\'t find an open Cardmarket tab. If "Auto-open tab" is on in Settings, it will try to open one for you. Otherwise open cardmarket.com manually and click Try again.',
            },
            {
                q: '"Not logged in to Cardmarket"',
                a: 'The extension found a Cardmarket tab but you\'re not signed in there. Log in to Cardmarket in that tab, then click Try again — or click "Go to Cardmarket" to jump straight to it.',
            },
            {
                q: '"Cardmarket access blocked"',
                a: 'You\'ve disabled site access for this extension. Go to chrome://extensions, find Deckswap Importer, and re-enable access to cardmarket.com under Site access.',
            },
            {
                q: '"Rate limited by Cardmarket"',
                a: 'Cardmarket is throttling requests temporarily. Wait a minute, then click Try again. Switching to Slow scan speed in Settings can prevent this from happening.',
            },
            {
                q: '"Connection failed"',
                a: 'The extension couldn\'t reach Cardmarket. Check your internet connection and click Try again.',
            },
            {
                q: '"No Pokémon Singles found"',
                a: 'You don\'t have any Pokémon Singles listed in your Cardmarket stock. Add some listings on Cardmarket and click Try again.',
            },
        ],
    },
    {
        title: 'Scanning',
        items: [
            {
                q: 'How long does a scan take?',
                a: 'Around 3 minutes for 1,000 cards on Normal speed, about an hour for 20,000. Large collections take longer — use Fast speed if you\'re not being rate-limited.',
            },
            {
                q: 'Can I use my browser while scanning?',
                a: 'Yes, but don\'t close the Cardmarket tab or navigate it away from your stock page. The extension injects its scan script into that tab and needs it to stay open.',
            },
            {
                q: 'What is the coloured dot on the extension icon?',
                a: 'It shows scan status at a glance — amber while scanning, green when complete, red when something needs attention. Visible even when the side panel is closed.',
            },
            {
                q: 'What if I see a rate limit countdown during the scan?',
                a: 'Cardmarket has temporarily throttled requests. The extension detects this automatically, waits, and retries — no action needed. If it happens repeatedly, pause and switch to Slow speed in Settings.',
            },
            {
                q: 'Can I cancel a scan?',
                a: 'Yes — click Cancel in the footer while scanning. Your progress up to the last completed page is saved, and you can resume later.',
            },
        ],
    },
    {
        title: 'Resuming & interruptions',
        items: [
            {
                q: 'What if I close the side panel mid-scan?',
                a: 'The scan keeps running in the Cardmarket tab. Reopen the side panel to see live progress — it catches up automatically.',
            },
            {
                q: 'What if the Cardmarket tab is closed mid-scan?',
                a: 'The scan stops. Your progress up to the last completed page is saved. Reopen the extension and click Resume scan to continue from where it stopped.',
            },
            {
                q: 'How do I resume a scan?',
                a: 'If a previous scan was interrupted, the detect screen shows a "Resume scan" button with the page it reached. Click it to continue, or "Start fresh" to scan everything from the beginning.',
            },
        ],
    },
    {
        title: 'Pushing to Deckswap',
        items: [
            {
                q: 'What happens after I push?',
                a: 'All scanned articles are sent to Deckswap and created as draft listings. They are not visible to buyers until you review and publish them in your Deckswap dashboard.',
            },
            {
                q: 'What if the push fails?',
                a: 'The button will show "Push failed — try again". Your scan result is still saved locally. Click the button again to retry — no need to rescan.',
            },
            {
                q: 'Can I scan and push again?',
                a: 'Yes. After a successful push, click "Scan again" to start a fresh scan. This clears the current result and returns to the detect screen.',
            },
        ],
    },
    {
        title: 'Settings',
        items: [
            {
                q: 'What does scan speed do?',
                a: 'Controls the delay between page requests — Slow (1 s), Normal (400 ms), Fast (100 ms). Use Slow if Cardmarket is rate-limiting you. Use Fast for large collections when you\'re not being throttled.',
            },
            {
                q: 'What is "Auto-open tab"?',
                a: 'When enabled, the extension automatically opens a Cardmarket tab in the background if none is found. Disable it if you prefer to manage your tabs manually.',
            },
            {
                q: 'What is "Account language"?',
                a: 'The language version of Cardmarket your account uses (e.g. cardmarket.com/en/ vs /de/). Leave it on Auto-detect unless the extension is picking the wrong language.',
            },
            {
                q: 'What does "Notify when done" do?',
                a: 'Sends a system notification when the scan finishes so you don\'t have to watch the panel. On macOS, Chrome notifications are suppressed when Chrome is the active app — use the green icon dot as an in-Chrome indicator instead.',
            },
        ],
    },
    {
        title: 'Scope & privacy',
        items: [
            {
                q: 'Which listings are imported?',
                a: 'Only Pokémon Singles from your Cardmarket stock. Sealed product, accessories, lots, and other game categories are not imported in this version.',
            },
            {
                q: 'What fields are imported for each card?',
                a: 'Card name, expansion, language, condition, price, quantity, and attributes — reverse holo, first edition, signed, altered, and playset flags — plus any seller comment.',
            },
            {
                q: 'Is my Cardmarket password stored anywhere?',
                a: 'No. The extension never asks for your Cardmarket password. It reads your stock using your existing browser session, exactly as if you were clicking through your stock yourself.',
            },
            {
                q: 'Where are my Deckswap credentials stored?',
                a: 'Your Deckswap access token is stored in chrome.storage.local — a sandboxed storage area only this extension can read. It is never written to disk or sent anywhere except the Deckswap API.',
            },
        ],
    },
];

type HelpModalProps = {
    open: boolean;
    onClose: () => void;
};

export function HelpModal({ open, onClose }: HelpModalProps) {
    const [openItem, setOpenItem] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <>
            <button
                aria-label="Close help"
                onClick={onClose}
                className="fixed inset-0 z-40 bg-bg-1/70 backdrop-blur-sm cursor-default animate-fade-in"
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-label="Help"
                className="fixed inset-0 z-50 m-3 bg-bg-2 border border-line-2 rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-none animate-fade-up"
            >
                <div className="flex flex-col h-full pointer-events-auto">
                    <header className="flex items-center px-4 py-3 border-b border-line-1 flex-shrink-0">
                        <h2 className="text-[15px] font-bold tracking-[-0.02em] text-ink-1">Help</h2>
                        <button
                            onClick={onClose}
                            aria-label="Close help"
                            className="ml-auto w-7 h-7 rounded-sm flex items-center justify-center text-ink-3 hover:text-ink-1 cursor-pointer hover:bg-bg-3 transition-all duration-[180ms]"
                        >
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin flex flex-col gap-5">
                        {SECTIONS.map((section) => (
                            <section key={section.title}>
                                <p className="font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-3 mb-2">
                                    {section.title}
                                </p>
                                <div className="border border-line-2 rounded-lg overflow-hidden">
                                    {section.items.map((item, i) => {
                                        const key = `${section.title}-${i}`;
                                        const isOpen = openItem === key;
                                        return (
                                            <div key={key} className={i > 0 ? 'border-t border-line-1' : ''}>
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenItem(isOpen ? null : key)}
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
                                                <div
                                                    className="grid transition-[grid-template-rows] duration-[200ms] ease-in-out"
                                                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                                                >
                                                    <div className="overflow-hidden">
                                                        <p className="px-4 pb-3 text-[12px] leading-[1.6] text-ink-3">
                                                            {item.a}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>

                    <footer className="px-4 py-3 border-t border-line-1 flex-shrink-0 bg-bg-1/30">
                        <p className="font-mono text-[10px] font-semibold tracking-[0.06em] text-ink-3 text-center">
                            More questions?{' '}
                            <a href="mailto:support@deckswap.com" className="text-blue hover:text-blue-link transition-colors">
                                support@deckswap.com
                            </a>
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
}
