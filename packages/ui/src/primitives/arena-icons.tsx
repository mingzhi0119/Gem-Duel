import type { CSSProperties, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & {
    label?: string;
};

const iconProps = (label?: string) =>
    label
        ? {
              role: 'img' as const,
              'aria-label': label,
          }
        : {
              'aria-hidden': true as const,
          };

export const ShieldIcon = ({ label, ...props }: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" {...iconProps(label)} {...props}>
        <path
            d="M8 1.25 13 3v3.96c0 3.02-1.79 5.78-4.56 7.02L8 14.19l-.44-.21C4.79 12.74 3 9.98 3 6.96V3l5-1.75Z"
            stroke="currentColor"
            strokeWidth="1.35"
        />
        <path d="M8 3.1v8.15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
    </svg>
);

export const TrophyIcon = ({ label, ...props }: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" {...iconProps(label)} {...props}>
        <path d="M5 2.25h6v2.5a3 3 0 0 1-6 0v-2.5Z" stroke="currentColor" strokeWidth="1.35" />
        <path
            d="M5 3H2.75v1A2.25 2.25 0 0 0 5 6.25M11 3h2.25v1A2.25 2.25 0 0 1 11 6.25"
            stroke="currentColor"
            strokeWidth="1.15"
        />
        <path d="M8 7.75v2.25M5.5 13.25h5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6.2 10.5h3.6v2.75H6.2z" stroke="currentColor" strokeWidth="1.15" />
    </svg>
);

export const CrownIcon = ({ label, ...props }: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" {...iconProps(label)} {...props}>
        <path
            d="m2.25 12 1.2-6L6.7 8.6 8 3.25l1.3 5.35L12.55 6l1.2 6H2.25Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="miter"
        />
        <path d="M2.25 12.75h11.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
);

export const MenuIcon = ({ label, ...props }: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" {...iconProps(label)} {...props}>
        <path d="M3 4.25h10M3 8h10M3 11.75h10" stroke="currentColor" strokeWidth="1.4" />
    </svg>
);

export const ArrowLeftIcon = ({ label, ...props }: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" {...iconProps(label)} {...props}>
        <path
            d="M9.75 3.25 5 8l4.75 4.75M5.35 8h6.15"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="square"
        />
    </svg>
);

export const ArrowRightIcon = ({ label, ...props }: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" {...iconProps(label)} {...props}>
        <path
            d="M6.25 3.25 11 8l-4.75 4.75M10.65 8H4.5"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="square"
        />
    </svg>
);

export const RefreshIcon = ({ label, ...props }: IconProps) => (
    <svg viewBox="0 0 16 16" fill="none" {...iconProps(label)} {...props}>
        <path
            d="M12.2 6.15A4.75 4.75 0 0 0 4.4 4.6L3 6m0 0V3.5M3 6h2.5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="square"
            strokeLinejoin="miter"
        />
        <path
            d="M3.8 9.85a4.75 4.75 0 0 0 7.8 1.55L13 10m0 0v2.5M13 10h-2.5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="square"
            strokeLinejoin="miter"
        />
    </svg>
);

const gemStyles: Record<string, CSSProperties> = {
    blue: { color: 'rgb(var(--gd-gem-blue-rgb))' },
    white: { color: 'rgb(var(--gd-gem-white-rgb))' },
    green: { color: 'rgb(var(--gd-gem-green-rgb))' },
    black: { color: 'rgb(var(--gd-gem-black-rgb))' },
    red: { color: 'rgb(var(--gd-gem-red-rgb))' },
    pearl: { color: 'rgb(var(--gd-gem-pearl-rgb))' },
    gold: { color: 'rgb(var(--gd-gem-gold-rgb))' },
};

export const GemIcon = ({
    color,
    label,
    style,
    ...props
}: IconProps & {
    color: keyof typeof gemStyles;
}) => (
    <svg
        viewBox="0 0 16 16"
        fill="none"
        {...iconProps(label)}
        {...props}
        style={{ ...gemStyles[color], ...style }}
    >
        <circle cx="8" cy="8" r="6.25" fill="currentColor" />
        <circle cx="6.1" cy="5.6" r="1.25" fill="rgb(255 255 255 / 0.72)" />
    </svg>
);
