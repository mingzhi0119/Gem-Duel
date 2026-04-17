import type { ReactNode } from 'react';
import type {
    GameSnapshot,
    PlayerSnapshot,
    RoomSummary,
    SpectatorSnapshot,
    UiActionDescriptor,
    UiViewModel,
} from '@gem-duel/contracts';

type SnapshotSummaryModel = GameSnapshot | PlayerSnapshot | SpectatorSnapshot;

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="gd-section">
        <div className="gd-section-header">
            <h2>{title}</h2>
        </div>
        <div>{children}</div>
    </section>
);

export const SnapshotSummary = ({ snapshot }: { snapshot: SnapshotSummaryModel }) => (
    <div className="gd-grid">
        <div className="gd-card">
            <strong>Phase</strong>
            <span>{snapshot.context.phase}</span>
        </div>
        <div className="gd-card">
            <strong>Current Player</strong>
            <span>{snapshot.context.currentPlayer}</span>
        </div>
        <div className="gd-card">
            <strong>Seed</strong>
            <span>{snapshot.context.seed}</span>
        </div>
        <div className="gd-card">
            <strong>Winner</strong>
            <span>{snapshot.context.winner ?? 'pending'}</span>
        </div>
    </div>
);

export const ActionList = ({
    actions,
    onSelect,
}: {
    actions: UiActionDescriptor[];
    onSelect: (action: UiActionDescriptor) => void;
}) => (
    <div className="gd-action-list">
        {actions.map((action) => (
            <button
                key={action.id}
                type="button"
                className="gd-button"
                disabled={action.disabled}
                onClick={() => onSelect(action)}
            >
                {action.label}
            </button>
        ))}
    </div>
);

export const MatchView = ({
    viewModel,
    onSelect,
    emptyActionLabel = 'No actions available for this viewer.',
    error,
    note,
}: {
    viewModel: UiViewModel;
    onSelect?: (action: UiActionDescriptor) => void;
    emptyActionLabel?: string;
    error?: string | null;
    note?: ReactNode;
}) => (
    <>
        <Section title={viewModel.title}>
            <p className="gd-muted">{viewModel.subtitle}</p>
            {note}
            {error ? <p className="gd-error">{error}</p> : null}
            <SnapshotSummary snapshot={viewModel.snapshot} />
        </Section>

        <Section title="Available Actions">
            {viewModel.availableActions.length > 0 && onSelect ? (
                <ActionList actions={viewModel.availableActions} onSelect={onSelect} />
            ) : (
                <p className="gd-muted">{emptyActionLabel}</p>
            )}
        </Section>

        <Section title="Event Log">
            <ol className="gd-log">
                {viewModel.snapshot.eventLog.map((event, index) => (
                    <li key={`${event.type}-${index}`}>
                        <code>{event.type}</code>
                    </li>
                ))}
            </ol>
        </Section>
    </>
);

export const RoomTable = ({ rooms }: { rooms: RoomSummary[] }) => (
    <table className="gd-table">
        <thead>
            <tr>
                <th>Room</th>
                <th>Status</th>
                <th>Mode</th>
                <th>Players</th>
            </tr>
        </thead>
        <tbody>
            {rooms.map((room) => (
                <tr key={room.roomId}>
                    <td>{room.roomId}</td>
                    <td>{room.status}</td>
                    <td>{room.mode}</td>
                    <td>{room.playerCount}</td>
                </tr>
            ))}
        </tbody>
    </table>
);
