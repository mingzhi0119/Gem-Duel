# ADR-0006: Board Selection Model and UiViewModel Projection

### Decision

- Choose the board-selection model that normalizes multi-step board interaction around engine-owned prompt and pending-selection semantics rather than client-owned draft intent.
- Treat `UiViewModel` 2.0 as the board-facing presentation contract that carries viewer role, session state, board/market/player-zone display state, prompt state, and sidecar metadata in an additive expansion.
- Sequence the work in two waves:
    - first land the additive `UiViewModel` 2.0 contract and projection surface;
    - then land the deeper pending-selection command/phase semantics where the engine must hold intermediate selection state.

### Rationale

- The current enumerated `UiActionDescriptor` model can expose legal one-shot commands, but it does not express the incremental interaction that a full board UI needs for privilege picks, linked gem selection, reserve-plus-gold flow, and chained prompts.
- Client-owned draft intent would move legality, recovery, and spectator/resync interpretation back toward page code, which conflicts with the Step 02.5 freeze around effect actors, `activeEffects`, and `effectPrompts`.
- An engine-owned selection model is a better long-term fit for online parity, spectator filtering, replay determinism, and future board-side highlighting because the same intermediate truth can be serialized, resynced, and filtered centrally.
- The repo still needs a near-term contract expansion before the deeper engine transition lands, otherwise board renderers remain blocked on a four-field `UiViewModel` surface and pages keep inferring status/viewer/selectable state locally.

### Consequences

- Phase 2 immediately expands `UiViewModel` and its related room/UI payloads additively, even before the full pending-selection runtime lands.
- The selected long-term direction is still engine-owned selection state, so later command/phase work must route through `contract-change` plus `add-phase-transition` rather than inventing client-local draft semantics.
- `apps/web/app/rooms/[roomId]/room-live-client.tsx` and similar consumers should migrate away from page-local room/viewer derivation as the expanded projection becomes available.
- Phase 2.5 and later board-renderer work can consume a richer projection contract without waiting for the final full-board renderer to exist.
