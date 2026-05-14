// src/popup/components/StepStrip.tsx

import { CheckIcon } from '../icons';

type StepState = 'done' | 'active' | 'pending';

type Step = {
    label: string;
    state: StepState;
};

type StepStripProps = {
    steps: Step[];
};

const itemStyles: Record<StepState, string> = {
    done: 'text-ink-2',
    active: 'bg-blue-bg text-blue',
    pending: 'text-ink-3',
};

const numStyles: Record<StepState, string> = {
    done: 'bg-green-bg border-green-border text-green',
    active: 'bg-blue-dark border-blue-dark text-white',
    pending: 'bg-bg-3 border-line-2 text-ink-3',
};

export function StepStrip({ steps }: StepStripProps) {
    return (
        <div
            role="list"
            aria-label="Import steps"
            className="flex items-center gap-2 p-1.5 mb-[18px] bg-bg-2 border border-line-1 rounded-md"
        >
            {steps.map((step, i) => (
                <div
                    key={i}
                    role="listitem"
                    className={[
                        'flex-1 flex items-center gap-1.5 px-2 py-[5px] rounded-sm',
                        'text-[11px] font-semibold transition-all duration-[180ms]',
                        itemStyles[step.state],
                    ].join(' ')}
                >
                    <span
                        className={[
                            'flex items-center justify-center flex-shrink-0',
                            'w-4 h-4 rounded-full border font-mono text-[10px] font-bold',
                            numStyles[step.state],
                        ].join(' ')}
                    >
                        {step.state === 'done' ? (
                            <CheckIcon size={12} />
                        ) : (
                            i + 1
                        )}
                    </span>
                    {step.label}
                </div>
            ))}
        </div>
    );
}
