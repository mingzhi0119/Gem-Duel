import { resolveUiLocale } from '@gem-duel/ui';
import { RoomLiveClient } from './room-live-client';

export default async function RoomDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ roomId: string }>;
    searchParams?: Promise<{ lang?: string | string[] }>;
}) {
    const { roomId } = await params;
    const query = searchParams ? await searchParams : undefined;
    const locale = resolveUiLocale(Array.isArray(query?.lang) ? query?.lang[0] : query?.lang);

    return <RoomLiveClient roomId={roomId} locale={locale} />;
}
