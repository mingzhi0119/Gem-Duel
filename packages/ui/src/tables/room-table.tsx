import type { RoomSummary } from '@gem-duel/contracts';

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
