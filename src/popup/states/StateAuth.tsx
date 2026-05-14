// src/popup/states/StateAuth.tsx

import { type FormEvent } from 'react';

type StateAuthProps = {
    email: string;
    password: string;
    submitting: boolean;
    error: string | null;
    onEmailChange: (v: string) => void;
    onPasswordChange: (v: string) => void;
    onSubmit: () => void;
};

export function StateAuth({
    email,
    password,
    submitting,
    error,
    onEmailChange,
    onPasswordChange,
    onSubmit,
}: StateAuthProps) {
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <form onSubmit={handleSubmit} className="text-center py-2">
            <span className="block font-mono text-[10px] font-semibold tracking-[0.14em] uppercase text-blue mb-3">
                Sign in to continue
            </span>
            <h2 className="text-[22px] font-bold tracking-[-0.02em] leading-[1.2] text-ink-1 mb-2">
                Connect your Deckswap account
            </h2>
            <p className="text-[13px] leading-[1.6] text-ink-3 max-w-[280px] mx-auto mb-5">
                We'll use your Deckswap login to stage your imported stock as
                drafts.
            </p>

            <div className="flex flex-col gap-2 text-left">
                <Field
                    label="Email"
                    type="email"
                    value={email}
                    onChange={onEmailChange}
                    autoFocus
                    disabled={submitting}
                />
                <Field
                    label="Password"
                    type="password"
                    value={password}
                    onChange={onPasswordChange}
                    disabled={submitting}
                />

                {error && (
                    <p
                        role="alert"
                        className="text-[12px] text-red-text leading-[1.5] px-1 -mt-1"
                    >
                        {error}
                    </p>
                )}
            </div>

            {/* Hidden submit so Enter still works */}
            <button
                type="submit"
                className="hidden"
                aria-hidden
                tabIndex={-1}
            />
        </form>
    );
}

/* ─── FORM FIELD ──────────────────────────────────── */

type FieldProps = {
    label: string;
    type: 'email' | 'password';
    value: string;
    onChange: (v: string) => void;
    autoFocus?: boolean;
    disabled?: boolean;
};

function Field({
    label,
    type,
    value,
    onChange,
    autoFocus,
    disabled,
}: FieldProps) {
    return (
        <label className="flex flex-col gap-1">
            <span className="font-mono text-[10px] font-semibold tracking-[0.10em] uppercase text-ink-3">
                {label}
            </span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoFocus={autoFocus}
                disabled={disabled}
                autoComplete={type === 'email' ? 'email' : 'current-password'}
                className={[
                    'h-10 px-3 rounded-md',
                    'bg-bg-2 border border-line-2 text-[13px] text-ink-1',
                    'placeholder:text-ink-3',
                    'outline-none transition-colors duration-[180ms]',
                    'focus:border-line-3 focus:ring-2 focus:ring-blue-border',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                ].join(' ')}
            />
        </label>
    );
}
