import type { UiActionDescriptor } from '@gem-duel/contracts';

export const ActionList = ({
    actions,
    onSelect,
}: {
    actions: UiActionDescriptor[];
    onSelect: (action: UiActionDescriptor) => void;
}) => (
    <div className="gd-action-list">
        {actions.map((action) => (
            <button
                key={action.id}
                type="button"
                className="gd-button"
                disabled={action.disabled}
                onClick={() => onSelect(action)}
            >
                {action.label}
            </button>
        ))}
    </div>
);
