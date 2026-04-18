import { proxyReplay } from '@/lib/room-service';
import { buildReplayInspectorModel } from '@gem-duel/application';
import { Section, resolveUiLocale } from '@gem-duel/ui';
import { ReplayClient } from './replay-client';

export default async function ReplayPage({
    params,
    searchParams,
}: {
    params: Promise<{ replayId: string }>;
    searchParams: Promise<{ lang?: string }>;
}) {
    const { replayId } = await params;
    const { lang } = await searchParams;
    const locale = resolveUiLocale(lang);
    const { status, body } = await proxyReplay(replayId);

    if (status >= 400 || 'bundle' in body === false) {
        return (
            <Section title={`${locale === 'zh' ? '回放' : 'Replay'} ${replayId}`}>
                <p>{'message' in body ? body.message : 'Replay is currently unavailable.'}</p>
            </Section>
        );
    }

    const inspector = buildReplayInspectorModel(body.bundle);
    if (!inspector.ok) {
        return (
            <Section title={`${locale === 'zh' ? '回放' : 'Replay'} ${replayId}`}>
                <p>{inspector.error.message}</p>
            </Section>
        );
    }

    return <ReplayClient replayId={replayId} locale={locale} inspector={inspector.value} />;
}
