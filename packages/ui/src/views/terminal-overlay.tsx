import type { VisibleSnapshot } from '@gem-duel/contracts';
import { getUiMessages, type UiLocale } from '../i18n/messages';

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
    const messages = getUiMessages(locale).terminalOverlay;
    const title =
        surface === 'replay'
            ? messages.replayTitle
            : surface === 'room'
              ? messages.roomTitle
              : messages.localTitle;

    return (
        <div className="gd-terminal-overlay" data-testid="terminal-overlay">
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
        </div>
    );
};
