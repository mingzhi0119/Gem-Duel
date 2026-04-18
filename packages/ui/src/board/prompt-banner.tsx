import type { UiPrompt } from '@gem-duel/contracts';

export const PromptBanner = ({ prompts }: { prompts: UiPrompt[] }) =>
    prompts.length > 0 ? (
        <div className="gd-prompt-list" aria-label="Prompt stack">
            {prompts.map((prompt) => (
                <article key={prompt.effectId} className="gd-prompt-card">
                    <div className="gd-card-slot-meta">
                        <strong>{prompt.label}</strong>
                        <span className="gd-card-slot-status">{prompt.atom}</span>
                    </div>
                    <span>
                        {prompt.remainingSelections !== null
                            ? `${prompt.remainingSelections} remaining`
                            : 'open-ended'}
                    </span>
                    {prompt.targetPlayer ? (
                        <span className="gd-muted">target: {prompt.targetPlayer}</span>
                    ) : null}
                    {prompt.cardId ? <span className="gd-muted">card: {prompt.cardId}</span> : null}
                </article>
            ))}
        </div>
    ) : (
        <p className="gd-muted">No active prompts in this scene.</p>
    );
