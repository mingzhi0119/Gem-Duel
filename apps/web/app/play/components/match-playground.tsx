'use client';

import { useEffect, useMemo, useState } from 'react';
import { createAiMatchSession, createLocalMatchSession } from '@gem-duel/application';
import type { UiActionDescriptor } from '@gem-duel/contracts';
import { Section, getUiMessages, type UiLocale } from '@gem-duel/ui';

import { ProductBackLink } from '@/app/components/product-back-link';
import {
    createLocalPhase4ScenarioSession,
    getLocalPhase4Scenario,
    type LocalPhase4ScenarioId,
} from '../local/scenarios';
import { SessionBoardShell } from './session-board-shell';

export function MatchPlayground({
    mode,
    seed,
    aiEnabled,
    roguelike = true,
    shellMode = 'default',
    scenarioId = null,
    locale = 'en',
}: {
    mode: 'local' | 'ai';
    seed: number;
    aiEnabled: boolean;
    roguelike?: boolean;
    shellMode?: 'default' | 'debug';
    scenarioId?: LocalPhase4ScenarioId | null;
    locale?: UiLocale;
}) {
    const messages = getUiMessages(locale);
    const scenario = scenarioId ? getLocalPhase4Scenario(scenarioId) : null;
    const sessionResult = useMemo(() => {
        const flags = {
            roguelike,
            onlineAuthoritative: false,
            aiEnabled,
        };

        if (mode === 'local' && scenarioId) {
            return createLocalPhase4ScenarioSession(scenarioId);
        }

        return mode === 'ai'
            ? createAiMatchSession({ seed, flags })
            : createLocalMatchSession({ seed, flags });
    }, [aiEnabled, mode, roguelike, scenarioId, seed]);
    const [, setRefreshKey] = useState(0);
    const [interactiveReady, setInteractiveReady] = useState(false);
    const [error, setError] = useState<string | null>(
        sessionResult.ok ? null : sessionResult.error.message
    );

    useEffect(() => {
        setInteractiveReady(true);
    }, []);

    if (!sessionResult.ok) {
        return (
            <Section title={`Interactive ${mode.toUpperCase()} Session`}>
                <p>
                    {sessionResult.ok
                        ? 'Session initialization failed.'
                        : sessionResult.error.message}
                </p>
            </Section>
        );
    }

    const session = sessionResult.value;
    const viewModel = session.viewModel();
    const currentFinalStateHash = session.replay().finalStateHash;
    const replayInspector = session.replayInspector();
    const aiTrace = session.aiTrace();

    const handleAction = (action: UiActionDescriptor) => {
        const result = session.dispatch(action.command);
        if (!result.ok) {
            setError(result.error.message);
            return;
        }

        setError(null);
        setRefreshKey((value) => value + 1);
    };

    const boardNote =
        mode === 'ai' ? (
            <p className="gd-muted">
                ZH: 在同一张战术主盘面上挑战 Gem Bot，AI trace 仅作为可选侧栏保留。 EN: Challenge
                the Gem Bot on the shared tactical board, with AI trace kept as an optional sidecar.
            </p>
        ) : (
            <p className="gd-muted">
                ZH: 拿取宝石、预购卡牌并扩展你的牌组，沿经典胜利竞速推进。 EN: Claim gems, reserve
                cards, and grow your tableau through the classic victory race.
            </p>
        );

    const legacyShellNote = (
        <>
            <p className="gd-muted">
                ZH: 这是应用层 session 直接驱动核心引擎的最小闭环。 EN: This is the minimal vertical
                slice from the application layer to the deterministic core engine.
            </p>
            {scenario ? (
                <div className="gd-muted">
                    <p>
                        Scenario: <strong data-testid="phase4-scenario-id">{scenario.id}</strong>
                    </p>
                    <p>Fixture Source: {scenario.startingFixtureSource}</p>
                    <p>
                        Expected finalStateHash:{' '}
                        <span data-testid="phase4-expected-hash">
                            {scenario.expectedFinalStateHash}
                        </span>
                    </p>
                    <p>
                        Current finalStateHash:{' '}
                        <span data-testid="current-final-state-hash">{currentFinalStateHash}</span>
                    </p>
                </div>
            ) : null}
            {shellMode === 'debug' ? (
                <p className="gd-muted" data-testid="phase4-shell-mode">
                    Debug shell fallback is active for this local route.
                </p>
            ) : null}
        </>
    );

    return (
        <>
            {interactiveReady ? <span hidden data-testid="phase4-interactive-ready" /> : null}
            <SessionBoardShell
                eyebrow={mode === 'ai' ? 'Classic AI' : 'Classic Local'}
                viewModel={viewModel}
                currentFinalStateHash={currentFinalStateHash}
                scenarioMeta={
                    scenario
                        ? {
                              id: scenario.id,
                              startingFixtureSource: scenario.startingFixtureSource,
                              expectedFinalStateHash: scenario.expectedFinalStateHash,
                          }
                        : null
                }
                onSelect={handleAction}
                replayInspector={replayInspector.ok ? replayInspector.value : null}
                aiTrace={mode === 'ai' ? aiTrace : null}
                shellMode={shellMode}
                boardNote={boardNote}
                legacyShellNote={legacyShellNote}
                routeTopbar={
                    <ProductBackLink
                        href={locale === 'zh' ? '/play/classic?lang=zh' : '/play/classic'}
                    >
                        {messages.playerEntry.backHomeLabel}
                    </ProductBackLink>
                }
                error={error}
                locale={locale}
            />
        </>
    );
}
