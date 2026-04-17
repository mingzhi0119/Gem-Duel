import type { ReactNode } from 'react';
import type { GameSnapshot, RoomSummary, UiActionDescriptor } from '@gem-duel/contracts';

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <section className="gd-section">
        <div className="gd-section-header">
            <h2>{title}</h2>
        </div>
        <div>{children}</div>
    </section>
);

export const SnapshotSummary = ({ snapshot }: { snapshot: GameSnapshot }) => (
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
