import React from 'react';
import { Monitor } from 'lucide-react';

interface ResolutionSwitcherProps {
    settings: {
        label: string;
        [key: string]: unknown;
    };
    resolution: string;
    setResolution: (res: string) => void;
    RESOLUTION_SETTINGS: Record<string, { label: string; [key: string]: unknown }>;
    theme: 'light' | 'dark';
}

export const ResolutionSwitcher: React.FC<ResolutionSwitcherProps> = ({
    settings,
    resolution,
    setResolution,
    RESOLUTION_SETTINGS,
    theme,
}) => {
    return (
        <div className="relative z-50 group outline-none" tabIndex={0}>
            <button
                aria-label="Change Resolution"
                className={`p-2 rounded-lg backdrop-blur-md border transition-all flex items-center gap-2 shadow-none
                ${
                    theme === 'dark'
                        ? 'bg-transparent hover:bg-white/10 text-slate-400 hover:text-slate-100 border-white/10 hover:border-white/20'
                        : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-200'
                }
            `}
            >
                <Monitor size={16} />
                <span className="text-xs font-bold hidden md:inline">{settings.label}</span>
            </button>

            <div className="absolute right-0 top-full pt-2 hidden group-hover:block group-focus-within:block w-32 animate-in fade-in slide-in-from-top-2">
                <div
                    className={`rounded-lg border overflow-hidden transition-all duration-500 shadow-none
                    ${
                        theme === 'dark'
                            ? 'bg-slate-900 border-white/10'
                            : 'bg-white border-stone-200 shadow-lg'
                    }
                `}
                >
                    {Object.entries(RESOLUTION_SETTINGS).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setResolution(key)}
                            className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors 
                                ${resolution === key ? 'text-emerald-400 ' + (theme === 'dark' ? 'bg-slate-900' : 'bg-emerald-50') : theme === 'dark' ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            {config.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
