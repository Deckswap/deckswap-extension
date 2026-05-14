// src/popup/components/Toggle.tsx

type ToggleProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
};

export function Toggle({ checked, onChange, label }: ToggleProps) {
    return (
        <div className="flex items-center justify-center p-2.5 bg-bg-2 border border-line-2 rounded-md flex-shrink-0">
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                onClick={() => onChange(!checked)}
                className={[
                    'relative flex-shrink-0 w-8 h-[18px] rounded-full border cursor-pointer',
                    'transition-colors duration-[180ms]',
                    checked
                        ? 'bg-blue-dark border-blue-dark'
                        : 'bg-bg-4 border-line-2',
                ].join(' ')}
            >
                <span
                    className={[
                        'absolute top-px w-[14px] h-[14px] rounded-full',
                        'transition-all duration-[180ms]',
                        checked ? 'left-[15px] bg-white' : 'left-px bg-ink-3',
                    ].join(' ')}
                />
            </button>
        </div>
    );
}
