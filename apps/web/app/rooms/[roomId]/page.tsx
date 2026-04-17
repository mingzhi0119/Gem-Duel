import { RoomLiveClient } from './room-live-client';

export default async function RoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = await params;

    return <RoomLiveClient roomId={roomId} />;
}
