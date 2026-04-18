import type { GameCommand } from '@gem-duel/contracts';
import { SidecarDrawer } from './sidecar-drawer';

export interface AiTraceCandidate {
    actionId: string;
    label: string;
    commandType: GameCommand['type'];
    score: number;
}

export interface AiTraceEntry {
    decisionIndex: number;
    player: string;
    sequence: number;
    chosenActionId: string;
    chosenCommandType: GameCommand['type'];
    candidates: AiTraceCandidate[];
}

export const AiTraceDrawer = ({ traces }: { traces: AiTraceEntry[] }) =>
    traces.length === 0 ? (
        <SidecarDrawer title="AI Trace">
            <p className="gd-muted">The AI has not made a deterministic decision in this scene.</p>
        </SidecarDrawer>
    ) : (
        <SidecarDrawer title="AI Trace">
            <ol className="gd-log gd-trace-list" tabIndex={0} aria-label="AI trace log">
                {traces.map((trace) => (
                    <li key={`${trace.sequence}-${trace.chosenActionId}`}>
                        <div className="gd-card-slot-meta">
                            <strong>{trace.chosenCommandType}</strong>
                            <span className="gd-card-slot-status">seq {trace.sequence}</span>
                        </div>
                        <span>
                            by {trace.player} via {trace.chosenActionId}
                        </span>
                        <pre className="gd-card gd-code-block">
                            <code>{JSON.stringify(trace.candidates.slice(0, 5), null, 2)}</code>
                        </pre>
                    </li>
                ))}
            </ol>
        </SidecarDrawer>
    );
