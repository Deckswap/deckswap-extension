// src/popup/PopupShell.tsx

import { useState, type ReactNode } from 'react';
import { DEV_DEFAULTS, DEV_TOOLS, type DevOptions } from '../lib/dev';
import { DevModal } from './components/DevModal';
import { HelpModal } from './components/HelpModal';
import { SettingsModal } from './components/SettingsModal';
import { DevIcon, HelpIcon, MinimizeIcon, SettingsIcon } from './icons';

type HeaderAction = 'help' | 'settings' | 'minimize';

type PopupShellProps = {
    children: ReactNode;
    actions?: HeaderAction[];
    showConnection?: boolean;
    cardmarketUsername?: string | null;
    deckswapUsername?: string | null;
    onSignOut?: () => void;
    onSettingsChange?: (s: import('../lib/settings').Settings) => void;
    footer?: ReactNode;
    footerStack?: boolean;
    devOptions?: DevOptions;
    onDevOptionsChange?: (opts: DevOptions) => void;
    onDevJumpToScanning?: () => void;
    onDevJumpToComplete?: () => void;
};

export function PopupShell({
    children,
    actions = ['help', 'settings'],
    showConnection = true,
    cardmarketUsername = null,
    deckswapUsername = null,
    onSignOut,
    onSettingsChange,
    footer,
    footerStack = false,
    devOptions,
    onDevOptionsChange,
    onDevJumpToScanning,
    onDevJumpToComplete,
}: PopupShellProps) {
    const [helpOpen, setHelpOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [devOpen, setDevOpen] = useState(false);

    return (
        <div className="relative bg-bg-1 overflow-hidden flex flex-col flex-1 min-h-0">
            <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse 360px 200px at 70% -40px, rgba(45,107,228,0.10) 0%, transparent 65%)',
                }}
            />

            <div className="relative z-10 flex flex-col flex-1 min-h-0">
                <header className="flex items-center px-4 py-3.5 border-b border-line-1 bg-bg-1/60 backdrop-blur-sm flex-shrink-0">
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="w-[7px] h-[7px] rounded-full bg-blue-dark" />
                        <span className="text-[17px] font-bold tracking-[-0.03em] text-ink-1">
                            Deckswap
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-ink-3 tracking-[0.10em] uppercase px-2 py-0.5 rounded-sm bg-bg-3 border border-line-2 ml-1">
                            v{chrome.runtime.getManifest().version}
                        </span>
                    </div>
                    <div className="ml-auto flex items-center gap-0.5">
                        {DEV_TOOLS && (
                            <HeaderIconBtn
                                label="Dev tools"
                                onClick={() => setDevOpen(true)}
                                active={
                                    devOptions?.detectOverride !== 'real' ||
                                    devOptions?.simulateRateLimit
                                }
                            >
                                <DevIcon size={16} />
                            </HeaderIconBtn>
                        )}
                        {actions.includes('help') && (
                            <HeaderIconBtn
                                label="Help"
                                onClick={() => setHelpOpen(true)}
                            >
                                <HelpIcon size={16} />
                            </HeaderIconBtn>
                        )}
                        {actions.includes('settings') && (
                            <HeaderIconBtn
                                label="Settings"
                                onClick={() => setSettingsOpen(true)}
                            >
                                <SettingsIcon size={16} />
                            </HeaderIconBtn>
                        )}
                        {actions.includes('minimize') && (
                            <HeaderIconBtn label="Minimize">
                                <MinimizeIcon size={16} />
                            </HeaderIconBtn>
                        )}
                    </div>
                </header>

                {showConnection && (
                    <ConnectionStrip
                        cardmarketUsername={cardmarketUsername}
                        deckswapUsername={deckswapUsername}
                    />
                )}

                <div className="flex-1 overflow-y-auto scrollbar-thin px-[18px] py-5">
                    {children}
                </div>

                {footer && (
                    <div
                        className={[
                            'px-4 py-3.5 border-t border-line-1 bg-bg-1/50 flex-shrink-0',
                            'flex items-center gap-2',
                            footerStack ? 'flex-col items-stretch gap-1.5' : '',
                        ].join(' ')}
                    >
                        {footer}
                    </div>
                )}
            </div>

            <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
            <SettingsModal
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                deckswapUsername={deckswapUsername}
                onSignOut={onSignOut ?? (() => {})}
                onSettingsChange={onSettingsChange ?? (() => {})}
            />
            {DEV_TOOLS && (
                <DevModal
                    open={devOpen}
                    onClose={() => setDevOpen(false)}
                    devOptions={devOptions ?? DEV_DEFAULTS}
                    onDevOptionsChange={onDevOptionsChange ?? (() => {})}
                    onJumpToScanning={onDevJumpToScanning ?? (() => {})}
                    onJumpToComplete={onDevJumpToComplete ?? (() => {})}
                />
            )}
        </div>
    );
}

function HeaderIconBtn({
    label,
    onClick,
    active = false,
    children,
}: {
    label: string;
    onClick?: () => void;
    active?: boolean;
    children: ReactNode;
}) {
    return (
        <button
            aria-label={label}
            onClick={onClick}
            className={[
                'relative w-8 h-8 rounded-sm flex items-center justify-center cursor-pointer transition-all duration-[180ms]',
                active
                    ? 'text-gold hover:bg-bg-3'
                    : 'text-ink-3 hover:text-ink-1 hover:bg-bg-3',
            ].join(' ')}
        >
            {active && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gold" />
            )}
            {children}
        </button>
    );
}

/* ─── CONNECTION STRIP ────────────────────────────── */

function ConnectionStrip({
    cardmarketUsername,
    deckswapUsername,
}: {
    cardmarketUsername: string | null;
    deckswapUsername: string | null;
}) {
    const bothConnected = !!cardmarketUsername && !!deckswapUsername;

    return (
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-line-1 bg-bg-2 flex-shrink-0">
            <Account
                code="CM"
                tone="cardmarket"
                label="Cardmarket"
                username={cardmarketUsername}
            />

            <svg
                className="w-4 h-4 text-ink-3 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
            </svg>

            <Account
                code="DS"
                tone="deckswap"
                label="Deckswap"
                username={deckswapUsername}
            />

            <span
                aria-label={
                    bothConnected
                        ? 'Both accounts connected'
                        : 'Waiting for connection'
                }
                className={[
                    'w-2 h-2 rounded-full flex-shrink-0 ml-auto',
                    bothConnected ? 'bg-green' : 'bg-ink-4',
                ].join(' ')}
                style={
                    bothConnected
                        ? { boxShadow: '0 0 8px rgba(34,200,122,0.6)' }
                        : undefined
                }
            />
        </div>
    );
}

function Account({
    code,
    tone,
    label,
    username,
}: {
    code: string;
    tone: 'cardmarket' | 'deckswap';
    label: string;
    username: string | null;
}) {
    const bubbleClass =
        tone === 'deckswap'
            ? 'bg-blue-bg border-blue-border text-blue'
            : 'bg-bg-3 border-line-2 text-ink-2';

    return (
        <>
            <div
                className={[
                    'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                    'font-mono text-[12px] font-bold border',
                    bubbleClass,
                ].join(' ')}
            >
                {code}
            </div>
            <div className="flex flex-col min-w-0 flex-1 leading-[1.3]">
                <span className="font-mono text-[10px] font-semibold tracking-[0.10em] uppercase text-ink-3">
                    {label}
                </span>
                {username ? (
                    <span className="text-[13px] font-semibold text-ink-1 truncate">
                        {tone === 'cardmarket' ? `@${username}` : username}
                    </span>
                ) : (
                    <span className="text-[12px] font-semibold text-ink-3 truncate italic">
                        Not connected
                    </span>
                )}
            </div>
        </>
    );
}
