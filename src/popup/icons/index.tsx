// src/popup/icons/index.tsx

type IconProps = {
    size?: number;
    className?: string;
};

const base = (size: number, className?: string) => ({
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
});

export function CheckIcon({ size = 14, className }: IconProps) {
    return (
        <svg {...base(size, className)} strokeWidth={3}>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

export function ArrowRightIcon({ size = 14, className }: IconProps) {
    return (
        <svg {...base(size, className)} strokeWidth={2.5}>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    );
}

export function ChevronRightIcon({ size = 14, className }: IconProps) {
    return (
        <svg {...base(size, className)} strokeWidth={2.5}>
            <polyline points="9 18 15 12 9 6" />
        </svg>
    );
}

export function ChevronDownIcon({ size = 14, className }: IconProps) {
    return (
        <svg {...base(size, className)} strokeWidth={2.5}>
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

export function HelpIcon({ size = 14, className }: IconProps) {
    return (
        <svg {...base(size, className)}>
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

export function SettingsIcon({ size = 14, className }: IconProps) {
    return (
        <svg {...base(size, className)}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    );
}

export function MinimizeIcon({ size = 14, className }: IconProps) {
    return (
        <svg {...base(size, className)}>
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

export function PlayIcon({ size = 14, className }: IconProps) {
    return (
        <svg {...base(size, className)} strokeWidth={2.5}>
            <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
    );
}

export function UploadIcon({ size = 14, className }: IconProps) {
    return (
        <svg {...base(size, className)} strokeWidth={2.5}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    );
}

export function DownloadIcon({ size = 14, className }: IconProps) {
    return (
        <svg {...base(size, className)}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );
}

export function DevIcon({ size = 14, className }: IconProps) {
    return (
        <svg {...base(size, className)}>
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
        </svg>
    );
}

export function AlertTriangleIcon({ size = 14, className }: IconProps) {
    return (
        <svg {...base(size, className)}>
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}
