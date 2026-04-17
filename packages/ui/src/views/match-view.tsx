import type { ReactNode } from 'react';
import type { UiActionDescriptor, UiViewModel } from '@gem-duel/contracts';
import { ActionList } from '../primitives/action-list';
import { Section } from '../primitives/section';
import { SnapshotSummary } from '../primitives/snapshot-summary';

export const MatchView = ({
    viewModel,
    onSelect,
    emptyActionLabel = 'No actions available for this viewer.',
    error,
    note,
}: {
    viewModel: UiViewModel;
    onSelect?: (action: UiActionDescriptor) => void;
    emptyActionLabel?: string;
    error?: string | null;
    note?: ReactNode;
}) => (
    <>
        <Section title={viewModel.title}>
            <p className="gd-muted">{viewModel.subtitle}</p>
            {note}
            {error ? <p className="gd-error">{error}</p> : null}
            <SnapshotSummary snapshot={viewModel.snapshot} />
        </Section>

        <Section title="Available Actions">
            {viewModel.availableActions.length > 0 && onSelect ? (
                <ActionList actions={viewModel.availableActions} onSelect={onSelect} />
            ) : (
                <p className="gd-muted">{emptyActionLabel}</p>
            )}
        </Section>

        <Section title="Event Log">
            <ol className="gd-log">
                {viewModel.snapshot.eventLog.map((event, index) => (
                    <li key={`${event.type}-${index}`}>
                        <code>{event.type}</code>
                    </li>
                ))}
            </ol>
        </Section>
    </>
);
