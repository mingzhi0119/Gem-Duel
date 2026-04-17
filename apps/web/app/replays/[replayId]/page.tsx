import { proxyReplay } from '@/lib/room-service';
import { buildReplayInspectorModel } from '@gem-duel/application';
import { Section } from '@gem-duel/ui';
import { ReplayInspectorPanel } from '../../components/session-panels';

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
            {status < 400 && 'bundle' in body
                ? (() => {
                      const inspector = buildReplayInspectorModel(body.bundle);
                      return inspector.ok ? <ReplayInspectorPanel model={inspector.value} /> : null;
                  })()
                : null}
        </>
    );
}
