import type { VisibleSnapshot } from '@gem-duel/contracts';
import { getUiMessages, type UiLocale } from '../i18n/messages';
import { SidecarDrawer } from '../drawer/sidecar-drawer';

export const TerminalOverlay = ({
    snapshot,
    currentFinalStateHash,
    locale = 'en',
    surface = 'play',
}: {
    snapshot: VisibleSnapshot;
    currentFinalStateHash: string;
    locale?: UiLocale;
    surface?: 'play' | 'replay' | 'room';
}) => {
    const uiMessages = getUiMessages(locale);
    const messages = uiMessages.terminalOverlay;
    const title =
        surface === 'replay'
            ? messages.replayTitle
            : surface === 'room'
              ? messages.roomTitle
              : messages.localTitle;
    const summary = `${snapshot.context.winner ?? messages.unknownWinner} • ${
        snapshot.context.victoryReason ?? messages.noReason
    }`;

    return (
        <div className="gd-terminal-overlay">
            <SidecarDrawer
                title={title}
                mode="drawer"
                placement="floating"
                triggerLabel={messages.eyebrow}
                triggerSummary={summary}
                triggerTestId="terminal-overlay-trigger"
                panelTestId="terminal-overlay"
                openLabel={uiMessages.drawer.openLabel}
                closeLabel={uiMessages.drawer.closeLabel}
            >
                <div className="gd-terminal-overlay-card">
                    <p className="gd-scene-eyebrow">{messages.eyebrow}</p>
                    <h2>{title}</h2>
                    <p className="gd-muted">
                        {messages.winnerLabel}:{' '}
                        <strong>{snapshot.context.winner ?? messages.unknownWinner}</strong>
                        {' • '}
                        {messages.reasonLabel}:{' '}
                        <strong>{snapshot.context.victoryReason ?? messages.noReason}</strong>
                    </p>
                    <p className="gd-muted">
                        {messages.hashLabel}:{' '}
                        <code data-testid="terminal-final-state-hash">{currentFinalStateHash}</code>
                    </p>
                </div>
            </SidecarDrawer>
        </div>
    );
};
