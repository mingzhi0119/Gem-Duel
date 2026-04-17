import { NextResponse } from 'next/server';
import { proxyRoom } from '@/lib/room-service';

export async function GET(_request: Request, context: { params: Promise<{ roomId: string }> }) {
    const { roomId } = await context.params;
    const { status, body } = await proxyRoom(roomId);
    return NextResponse.json(body, { status });
}
