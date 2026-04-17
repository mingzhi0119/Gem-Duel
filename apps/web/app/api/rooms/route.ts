import { NextRequest, NextResponse } from 'next/server';
import { proxyCreateRoom } from '@/lib/room-service';
import { CreateRoomRequestSchema } from '@gem-duel/contracts';

export async function POST(request: NextRequest) {
    const payload = CreateRoomRequestSchema.parse(await request.json());
    const { status, body } = await proxyCreateRoom(payload);
    return NextResponse.json(body, { status });
}
