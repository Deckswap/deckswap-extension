// src/popup/components/Button.tsx

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'destructive-ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    block?: boolean;
    grow?: boolean;
    children: ReactNode;
};

const variantStyles: Record<Variant, string> = {
    primary:
        'bg-blue-dark text-white hover:bg-[#3a7af0] hover:shadow-[0_4px_16px_rgba(45,107,228,0.35)] disabled:opacity-35 disabled:cursor-not-allowed disabled:shadow-none',
    ghost: 'bg-transparent border border-line-2 text-ink-2 hover:bg-bg-3 hover:text-ink-1',
    'destructive-ghost':
        'bg-transparent border border-line-2 text-ink-3 hover:bg-red-bg hover:border-red-border hover:text-red-text',
};

export function Button({
    variant = 'primary',
    block = false,
    grow = false,
    className = '',
    children,
    ...rest
}: ButtonProps) {
    return (
        <button
            {...rest}
            className={[
                'inline-flex items-center justify-center gap-1.5',
                'px-[18px] py-2.5 rounded-full',
                'text-[13px] font-semibold leading-none font-sans',
                'cursor-pointer transition-all duration-[180ms]',
                'border-none',
                variantStyles[variant],
                block ? 'w-full' : '',
                grow ? 'flex-1' : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            {children}
        </button>
    );
}
