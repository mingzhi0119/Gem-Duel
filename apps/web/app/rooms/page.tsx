import { resolveUiLocale } from '@gem-duel/ui';
import { CreateRoomPanel } from './components/create-room-panel';

export default async function RoomsPage({
    searchParams,
}: {
    searchParams?: Promise<{ lang?: string | string[] }>;
}) {
    const params = searchParams ? await searchParams : undefined;
    const locale = resolveUiLocale(Array.isArray(params?.lang) ? params?.lang[0] : params?.lang);

    return <CreateRoomPanel locale={locale} />;
}
