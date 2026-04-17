import { proxyReplay } from '@/lib/room-service';
import { Section, SnapshotSummary } from '@gem-duel/ui';

export default async function ReplayPage({ params }: { params: Promise<{ replayId: string }> }) {
    const { replayId } = await params;
    const { status, body } = await proxyReplay(replayId);

    return (
        <>
            <Section title={`Replay ${replayId}`}>
                <p className="gd-muted">
                    ZH: 回放页消费权威 `ReplayBundle`，用于确认线上房间最终产物与版本边界。 EN:
                    Replay pages consume the authoritative `ReplayBundle` so the shells can inspect
                    the final room-service output and version boundary.
                </p>
                {status >= 400 || 'bundle' in body === false ? (
                    <p>{'message' in body ? body.message : 'Replay is currently unavailable.'}</p>
                ) : (
                    <div className="gd-grid">
                        <div className="gd-card">
                            <strong>Final Hash</strong>
                            <span>{body.bundle.finalStateHash}</span>
                        </div>
                        <div className="gd-card">
                            <strong>Winner</strong>
                            <span>{body.bundle.resultSummary.winner ?? 'pending'}</span>
                        </div>
                        <div className="gd-card">
                            <strong>Reason</strong>
                            <span>{body.bundle.resultSummary.reason ?? 'pending'}</span>
                        </div>
                        <div className="gd-card">
                            <strong>Commands</strong>
                            <span>{body.bundle.commands.length}</span>
                        </div>
                    </div>
                )}
            </Section>
            {status < 400 && 'bundle' in body ? (
                <Section title="Initial Snapshot">
                    <SnapshotSummary snapshot={body.bundle.initialSnapshot} />
                </Section>
            ) : null}
        </>
    );
}
