import { Section } from '@gem-duel/ui';

export default async function ReplayPage({ params }: { params: Promise<{ replayId: string }> }) {
    const { replayId } = await params;

    return (
        <Section title={`Replay ${replayId}`}>
            <p className="gd-muted">
                ZH: 回放页将消费版本化 ReplayBundle。 EN: Replay pages consume versioned
                ReplayBundle payloads from the room-service or archival storage.
            </p>
        </Section>
    );
}
