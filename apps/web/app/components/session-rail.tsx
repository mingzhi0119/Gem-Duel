'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { UiSessionStatus, UiViewerRole } from '@gem-duel/contracts';
import {
    DEFAULT_SHELL_STYLE_ID,
    DEFAULT_SHELL_THEME_MODE,
    SHELL_PRESENTATION_SYNC_EVENT,
    SHELL_STYLE_QUERY_PARAM,
    SHELL_STYLE_REGISTRY,
    SHELL_STYLE_STORAGE_KEY,
    SHELL_THEME_MODES,
    SHELL_THEME_QUERY_PARAM,
    SHELL_THEME_STORAGE_KEY,
    SidecarDrawer,
    getUiMessages,
    resolveResolvedShellTheme,
    resolveShellPresentation,
    type ShellThemeMode,
    type UiLocale,
} from '@gem-duel/ui';

const PREFERS_DARK_MEDIA = '(prefers-color-scheme: dark)';

const getThemeLabel = (
    themeMode: ShellThemeMode,
    messages: ReturnType<typeof getUiMessages>['sessionRail']
) => {
    switch (themeMode) {
        case 'dark':
            return messages.themeDarkLabel;
        case 'light':
            return messages.themeLightLabel;
        case 'system':
            return messages.themeSystemLabel;
    }
};

const getViewerLabel = (
    viewerRole: UiViewerRole,
    messages: ReturnType<typeof getUiMessages>['sessionRail']
) => (viewerRole === 'player' ? messages.viewerPlayer : messages.viewerSpectator);

const getSurfaceLabel = (
    surface: 'play' | 'room' | 'replay',
    messages: ReturnType<typeof getUiMessages>['sessionRail']
) => {
    switch (surface) {
        case 'play':
            return messages.surfacePlay;
        case 'room':
            return messages.surfaceRoom;
        case 'replay':
            return messages.surfaceReplay;
    }
};

const getStatusLabel = (
    sessionStatus: UiSessionStatus,
    messages: ReturnType<typeof getUiMessages>['sessionRail']
) => {
    switch (sessionStatus) {
        case 'waiting-opponent':
            return messages.statusWaitingOpponent;
        case 'active':
            return messages.statusActive;
        case 'completed':
            return messages.statusCompleted;
        case 'replay':
            return messages.statusReplay;
        case 'resyncing':
            return messages.statusResyncing;
        case 'disconnected':
            return messages.statusDisconnected;
    }
};

const syncDocumentPresentation = (themeMode: ShellThemeMode, styleId: string) => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia(PREFERS_DARK_MEDIA).matches;

    root.dataset.gdThemeMode = themeMode;
    root.dataset.gdResolvedTheme = resolveResolvedShellTheme(themeMode, prefersDark);
    root.dataset.gdStyle = styleId;
};

export function SessionRail({
    locale,
    surface,
    sessionStatus,
    viewerRole,
    currentFinalStateHash,
    hashUnavailableLabel,
    presentation = 'drawer',
}: {
    locale: UiLocale;
    surface: 'play' | 'room' | 'replay';
    sessionStatus: UiSessionStatus;
    viewerRole: UiViewerRole;
    currentFinalStateHash?: string | null;
    hashUnavailableLabel: string;
    presentation?: 'drawer' | 'inline';
}) {
    const messages = getUiMessages(locale).sessionRail;
    const [themeMode, setThemeMode] = useState<ShellThemeMode>(DEFAULT_SHELL_THEME_MODE);
    const [styleId, setStyleId] = useState(DEFAULT_SHELL_STYLE_ID);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const storedThemeMode = window.localStorage.getItem(SHELL_THEME_STORAGE_KEY);
        const storedStyleId = window.localStorage.getItem(SHELL_STYLE_STORAGE_KEY);
        const nextPresentation = resolveShellPresentation({
            requestedThemeMode: params.get(SHELL_THEME_QUERY_PARAM),
            storedThemeMode,
            requestedStyleId: params.get(SHELL_STYLE_QUERY_PARAM),
            storedStyleId,
        });

        setThemeMode(nextPresentation.themeMode);
        setStyleId(nextPresentation.styleId);
    }, []);

    const handleThemeChange = (nextThemeMode: ShellThemeMode) => {
        const url = new URL(window.location.href);

        window.localStorage.setItem(SHELL_THEME_STORAGE_KEY, nextThemeMode);
        window.localStorage.setItem(SHELL_STYLE_STORAGE_KEY, styleId);
        url.searchParams.set(SHELL_THEME_QUERY_PARAM, nextThemeMode);
        window.history.replaceState({}, '', url.toString());

        setThemeMode(nextThemeMode);
        syncDocumentPresentation(nextThemeMode, styleId);
        window.dispatchEvent(new Event(SHELL_PRESENTATION_SYNC_EVENT));
    };

    const handleRestart = () => {
        window.location.assign(window.location.href);
    };

    const styleDefinition = SHELL_STYLE_REGISTRY[styleId];
    const actionLabel = surface === 'play' ? messages.restartLabel : messages.reloadLabel;
    const actionNote = surface === 'play' ? messages.restartNote : messages.reloadNote;

    const railBody = (
        <div className="gd-session-rail" data-testid="session-rail">
            <section className="gd-session-rail-section">
                <div className="gd-session-rail-section-header">
                    <strong>{messages.summaryTitle}</strong>
                </div>
                <dl className="gd-session-rail-summary">
                    <div className="gd-session-rail-summary-row">
                        <dt>{messages.statusLabel}</dt>
                        <dd data-testid="session-rail-status">
                            {getStatusLabel(sessionStatus, messages)}
                        </dd>
                    </div>
                    <div className="gd-session-rail-summary-row">
                        <dt>{messages.viewerLabel}</dt>
                        <dd>{getViewerLabel(viewerRole, messages)}</dd>
                    </div>
                    <div className="gd-session-rail-summary-row">
                        <dt>{messages.surfaceLabel}</dt>
                        <dd>{getSurfaceLabel(surface, messages)}</dd>
                    </div>
                    <div className="gd-session-rail-summary-row">
                        <dt>{messages.hashLabel}</dt>
                        <dd>
                            <code data-testid="session-rail-hash">
                                {currentFinalStateHash ?? hashUnavailableLabel}
                            </code>
                        </dd>
                    </div>
                </dl>
            </section>

            <section className="gd-session-rail-section">
                <fieldset className="gd-session-rail-fieldset">
                    <legend className="gd-session-rail-section-header">
                        <strong>{messages.themeTitle}</strong>
                    </legend>
                    <div className="gd-session-rail-choice-grid">
                        {SHELL_THEME_MODES.map((mode) => (
                            <label
                                key={mode}
                                className={
                                    themeMode === mode
                                        ? 'gd-session-rail-choice is-selected'
                                        : 'gd-session-rail-choice'
                                }
                                data-testid={`session-rail-theme-${mode}`}
                            >
                                <input
                                    type="radio"
                                    name={`gd-session-theme-${surface}`}
                                    value={mode}
                                    checked={themeMode === mode}
                                    onChange={() => handleThemeChange(mode)}
                                />
                                <span>{getThemeLabel(mode, messages)}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>
            </section>

            <section className="gd-session-rail-section">
                <div className="gd-session-rail-section-header">
                    <strong>{messages.styleTitle}</strong>
                </div>
                <div className="gd-session-rail-style-card" data-testid="session-rail-style">
                    <span className="gd-muted">{messages.styleStatusLabel}</span>
                    <strong>{messages.styleCurrentLabel}</strong>
                    <span className="gd-shell-badge">{styleDefinition.id}</span>
                </div>
            </section>

            <section className="gd-session-rail-section">
                <div className="gd-session-rail-section-header">
                    <strong>{messages.rulesLabel}</strong>
                </div>
                <div className="gd-session-rail-actions">
                    <Link
                        href="/rulebook"
                        className="gd-link"
                        data-testid="session-rail-rules"
                        prefetch={false}
                    >
                        {messages.rulesLabel}
                    </Link>
                    <button
                        type="button"
                        className="gd-button gd-button-muted"
                        data-testid="session-rail-restart"
                        onClick={handleRestart}
                    >
                        {actionLabel}
                    </button>
                </div>
                <p className="gd-muted">{messages.rulesNote}</p>
                <p className="gd-muted">{actionNote}</p>
            </section>
        </div>
    );

    if (presentation === 'inline') {
        return railBody;
    }

    return <SidecarDrawer title={messages.title}>{railBody}</SidecarDrawer>;
}
