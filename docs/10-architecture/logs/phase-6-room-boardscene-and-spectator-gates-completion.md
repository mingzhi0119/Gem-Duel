# Phase 6 Completion - Rooms BoardScene and Spectator Gates

Date: 2026-04-18  
Phase: Phase 6 - `/rooms/[roomId]`, Spectator, and Online Consistency Gates  
Status: `Completed`

## Scope

- Move the online room route from the legacy `MatchView` validation shell onto the shared `BoardScene`.
- Close the spectator pending-selection leak at the runtime/projection layer instead of papering over it in page-local UI state.
- Add mechanical gates for spectator leakage, resync preservation, and browser-level spectator / out-of-turn inertness.

## Landed Results

- `apps/web/app/rooms/[roomId]/room-live-client.tsx` now renders the shared `BoardScene` instead of `MatchView`.
- `packages/ui/src/views/board-scene.tsx` now exposes the test hooks and read-only affordance behavior needed for live rooms:
    - viewer/session badges now have stable `data-testid`s;
    - missing live-room hash now renders an explicit unavailable badge instead of a fake hash string;
    - board / market / royal / confirm / cancel affordances now become truly inert when `onSelect` is absent.
- `packages/contracts/src/snapshots.ts` now redacts `pendingSelection` from `SpectatorSnapshot`.
- `packages/application/src/view-model/selection.ts` now prevents spectator `selectionDraft` projection from re-materializing pending-command drafts after the snapshot redaction.
- `packages/application/src/view-model/spectator-visibility.test.ts` now enforces the serialized spectator-view-model leakage invariant.
- `apps/room-service/src/app.test.ts` now verifies that:
    - spectator observe payloads redact pending-selection state;
    - player resync still preserves pending-selection state for the authoritative seat.
- `apps/web/tests/phase6/room-boardscene.spec.ts` and `tools/check-phase6.mjs` now gate:
    - shared `BoardScene` rendering for `/rooms/[roomId]`;
    - spectator non-interactivity;
    - out-of-turn player read-only behavior.

## Files

- `packages/contracts/src/snapshots.ts`
- `packages/application/src/view-model/selection.ts`
- `packages/application/src/view-model/spectator-visibility.test.ts`
- `packages/ui/src/views/board-scene.tsx`
- `apps/web/app/rooms/[roomId]/room-live-client.tsx`
- `apps/web/tests/phase6/room-boardscene.spec.ts`
- `apps/room-service/src/app.test.ts`
- `tools/check-phase6.mjs`
- `package.json`
- `docs/30-contracts/phase-2-uiviewmodel-2.0-migration-note.md`
- `docs/10-architecture/full-board-ui-roadmap.md`
- `docs/40-operations/release-prep.md`

## Remaining Caveats

- Room-status fanout still does not guarantee that the first bound player flips from `waiting-opponent` to `active` immediately when the second seat joins. Phase 6 closes shared-board convergence and spectator leakage gating, but does not claim every room-status cosmetic is now strongly synchronized.
- Replay-board convergence, keyboard/A11y/mobile polish, and i18n are deferred to Phase 7.

## Validation

- `pnpm --filter @gem-duel/application test`
- `pnpm --filter @gem-duel/room-service test`
- `pnpm --filter @gem-duel/web typecheck`
- `pnpm check-phase6`
