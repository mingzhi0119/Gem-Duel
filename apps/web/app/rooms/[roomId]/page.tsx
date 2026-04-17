import { Section } from '@gem-duel/ui';

export default async function RoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = await params;

    return (
        <Section title={`Room ${roomId}`}>
            <p className="gd-muted">
                ZH: 该页面预留给 WebSocket 房间状态流与观战模式。 EN: This route is reserved for
                room state streaming and future spectator support.
            </p>
            <p>Configured room id: {roomId}</p>
        </Section>
    );
}
