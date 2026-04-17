import { NextRequest, NextResponse } from 'next/server';
import { JoinRoomRequestSchema } from '@gem-duel/contracts';
import { proxyJoinRoom } from '@/lib/room-service';

export async function POST(request: NextRequest, context: { params: Promise<{ roomId: string }> }) {
    const { roomId } = await context.params;
    const payload = JoinRoomRequestSchema.parse(await request.json());
    const { status, body } = await proxyJoinRoom(roomId, payload);
    return NextResponse.json(body, { status });
}
