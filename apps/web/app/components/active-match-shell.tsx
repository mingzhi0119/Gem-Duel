'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { UiActionDescriptor } from '@gem-duel/contracts';
import { LazyMotion, domAnimation, m } from 'framer-motion';

type MatchSurface = 'play' | 'room' | 'replay';

interface MatchSurfaceInteractionContextValue {
    surface: MatchSurface;
    liveMessage: string;
    announceAction: (action: Pick<UiActionDescriptor, 'label'>) => void;
    announceMessage: (message: string | null) => void;
}

const MatchSurfaceInteractionContext = createContext<MatchSurfaceInteractionContextValue | null>(
    null
);

export const useMatchSurfaceInteraction = () => {
    const context = useContext(MatchSurfaceInteractionContext);

    if (!context) {
        throw new Error('useMatchSurfaceInteraction must be used within ActiveMatchShell.');
    }

    return context;
};

export function MatchSurfaceInteractionProvider({
    surface,
    children,
}: {
    surface: MatchSurface;
    children: ReactNode;
}) {
    const [liveMessage, setLiveMessage] = useState('');

    useEffect(() => {
        if (!liveMessage) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setLiveMessage('');
        }, 1800);

        return () => window.clearTimeout(timeout);
    }, [liveMessage]);

    const value = useMemo<MatchSurfaceInteractionContextValue>(
        () => ({
            surface,
            liveMessage,
            announceAction(action) {
                setLiveMessage(action.label);
            },
            announceMessage(message) {
                setLiveMessage(message ?? '');
            },
        }),
        [liveMessage, surface]
    );

    return (
        <MatchSurfaceInteractionContext.Provider value={value}>
            {children}
            <span className="sr-only" aria-live="polite" aria-atomic="true">
                {liveMessage}
            </span>
        </MatchSurfaceInteractionContext.Provider>
    );
}

export function ActiveMatchShellFrame({
    surface,
    routeTopbar = null,
    children,
}: {
    surface: MatchSurface;
    routeTopbar?: ReactNode;
    children: ReactNode;
}) {
    const shellRowsClass = routeTopbar
        ? 'grid-rows-[auto_minmax(0,1fr)]'
        : 'grid-rows-[minmax(0,1fr)]';

    return (
        <LazyMotion features={domAnimation}>
            <m.section
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className={`gd-route-stack gd-route-stack-match relative grid h-[calc(100dvh-(var(--gd-main-shell-padding)*2))] w-full gap-3 overflow-hidden ${shellRowsClass} xl:gap-4`}
                data-gd-landscape-shell="true"
                data-gd-match-surface={surface}
                data-testid={`active-match-shell-${surface}`}
            >
                {routeTopbar ? (
                    <m.div
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full"
                    >
                        {routeTopbar}
                    </m.div>
                ) : null}
                <m.div layout className="relative h-full min-h-0 overflow-hidden">
                    {children}
                </m.div>
            </m.section>
        </LazyMotion>
    );
}
