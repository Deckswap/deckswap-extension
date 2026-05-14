// src/popup/components/Pill.tsx

import type { ReactNode } from 'react';

type PillProps = {
    children: ReactNode;
    selected?: boolean;
    onClick?: () => void;
    dot?: boolean;
    count?: ReactNode;
};

export function Pill({
    children,
    selected = false,
    onClick,
    dot = false,
    count,
}: PillProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={[
                'inline-flex items-center gap-1.5',
                'px-[11px] py-1.5 rounded-full',
                'text-xs font-semibold cursor-pointer',
                'border transition-all duration-[180ms]',
                selected
                    ? 'bg-blue-bg border-blue-border text-blue'
                    : 'bg-bg-2 border-line-2 text-ink-3 hover:border-line-3 hover:text-ink-1',
            ].join(' ')}
        >
            {dot && (
                <span
                    className={[
                        'w-[5px] h-[5px] rounded-full',
                        selected ? 'bg-blue' : 'bg-ink-3',
                    ].join(' ')}
                />
            )}
            <span>{children}</span>
            {count !== undefined && (
                <span className="font-mono text-[10px] font-semibold text-ink-3">
                    {count}
                </span>
            )}
        </button>
    );
}
