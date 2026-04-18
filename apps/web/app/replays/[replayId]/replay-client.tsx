'use client';

import Link from 'next/link';
import { useMemo, useState, useEffectEvent, type KeyboardEvent } from 'react';
import { buildUiViewModel, type ReplayInspectorModel } from '@gem-duel/application';
import { BoardScene, ReplayDrawer, getUiMessages, type UiLocale } from '@gem-duel/ui';

const clampStepIndex = (index: number, max: number) => Math.max(0, Math.min(index, max));

export function ReplayClient({
    replayId,
    locale,
    inspector,
}: {
    replayId: string;
    locale: UiLocale;
    inspector: ReplayInspectorModel;
}) {
    const messages = getUiMessages(locale);
    const [selectedStepIndex, setSelectedStepIndex] = useState(
        Math.max(inspector.steps.length - 1, 0)
    );
    const selectedStep =
        inspector.steps[selectedStepIndex] ?? inspector.steps[inspector.steps.length - 1];
    if (!selectedStep) {
        return null;
    }

    const viewModel = useMemo(
        () => buildUiViewModel(selectedStep.snapshot, 'spectator'),
        [selectedStep.snapshot]
    );

    const handleKeyDown = useEffectEvent((event: KeyboardEvent<HTMLDivElement>) => {
        if (inspector.steps.length === 0) {
            return;
        }

        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                setSelectedStepIndex((current) =>
                    clampStepIndex(current - 1, inspector.steps.length - 1)
                );
                break;
            case 'ArrowRight':
                event.preventDefault();
                setSelectedStepIndex((current) =>
                    clampStepIndex(current + 1, inspector.steps.length - 1)
                );
                break;
            case 'Home':
                event.preventDefault();
                setSelectedStepIndex(0);
                break;
            case 'End':
                event.preventDefault();
                setSelectedStepIndex(inspector.steps.length - 1);
                break;
            default:
                break;
        }
    });

    return (
        <div
            className="gd-scene-stack"
            data-testid="replay-client"
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            <BoardScene
                eyebrow={messages.replay.eyebrow}
                viewModel={viewModel}
                currentFinalStateHash={selectedStep.snapshotHash}
                hashUnavailableLabel={messages.boardScene.replayHashUnavailableLabel}
                locale={locale}
                surface="replay"
                note={
                    <div className="gd-replay-note">
                        <p className="gd-muted">{messages.replay.note}</p>
                        <div className="gd-replay-meta">
                            <span className="gd-shell-badge">
                                {messages.replay.currentStepLabel} {selectedStep.index}
                            </span>
                            <span
                                className="gd-shell-badge"
                                data-testid="replay-current-step-label"
                            >
                                {selectedStep.label}
                            </span>
                            <span className="gd-muted">{messages.replay.keyboardHint}</span>
                        </div>
                        <div
                            className="gd-locale-switch"
                            aria-label={messages.replay.localeLabel}
                            data-testid="replay-locale-switch"
                        >
                            <span className="gd-muted">{messages.replay.localeLabel}</span>
                            <Link
                                href={`/replays/${replayId}?lang=en`}
                                className="gd-link"
                                prefetch={false}
                            >
                                {messages.replay.localeEnglish}
                            </Link>
                            <Link
                                href={`/replays/${replayId}?lang=zh`}
                                className="gd-link"
                                prefetch={false}
                            >
                                {messages.replay.localeChinese}
                            </Link>
                        </div>
                    </div>
                }
                extraSidecars={
                    <ReplayDrawer
                        model={inspector}
                        locale={locale}
                        selectedStepIndex={selectedStepIndex}
                        onSelectStepIndex={setSelectedStepIndex}
                    />
                }
            />
        </div>
    );
}
