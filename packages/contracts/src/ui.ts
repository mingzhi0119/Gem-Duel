import { z } from 'zod';
import { GameCommandSchema } from './game';
import { VisibleSnapshotSchema } from './snapshots';

export const UiActionDescriptorSchema = z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    command: GameCommandSchema,
    disabled: z.boolean().optional(),
});

export const UiViewModelSchema = z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    snapshot: VisibleSnapshotSchema,
    availableActions: z.array(UiActionDescriptorSchema),
});

export type UiActionDescriptor = z.infer<typeof UiActionDescriptorSchema>;
export type UiViewModel = z.infer<typeof UiViewModelSchema>;
