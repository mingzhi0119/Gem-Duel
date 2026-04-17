import { NextResponse } from 'next/server';
import { proxyHealth } from '@/lib/room-service';

export async function GET() {
    const { status, body } = await proxyHealth();
    return NextResponse.json(body, { status });
}
