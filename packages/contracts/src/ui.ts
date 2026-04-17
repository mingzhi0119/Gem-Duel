import type { GameCommand } from './game';
import type { GameSnapshot } from './snapshots';

export interface UiActionDescriptor {
    id: string;
    label: string;
    command: GameCommand;
    disabled?: boolean;
}

export interface UiViewModel {
    title: string;
    subtitle: string;
    snapshot: GameSnapshot;
    availableActions: UiActionDescriptor[];
}
