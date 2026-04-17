import { NextResponse } from 'next/server';
import { proxyReplay } from '@/lib/room-service';

export async function GET(_request: Request, context: { params: Promise<{ replayId: string }> }) {
    const { replayId } = await context.params;
    const { status, body } = await proxyReplay(replayId);
    return NextResponse.json(body, { status });
}
