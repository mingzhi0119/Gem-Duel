# Hardening Wave 1 - Standalone Checks, Room-Status Fanout, Visual Policy, and A11y

Date: 2026-04-18

## Scope

This wave closes the directly actionable items left in the `Remaining Hardening Backlog` after Phase 8:

- Milestone K: platform-agnostic visual baselines and CI-side snapshot-update guardrails;
- room-status cosmetic fanout consistency for `/rooms/[roomId]`;
- removal of the old `next start` warning path from repo-level browser/visual gates;
- a repo-wide axe-core harness for the product board surfaces.

The wave does **not** introduce app-wide locale routing or Desktop signing / store distribution. Those remain product/distribution decisions outside this closeout.

## Landed Results

- Playwright screenshot baselines now use platform-agnostic names:
    - `apps/web/tests/visual/local-board.spec.ts-snapshots/local-board-take-three-linked-gems.png`
    - `apps/web/tests/visual/playground.spec.ts-snapshots/{classic-selection,run-sidecar,spectator-resync,terminal-victory}.png`
    - `apps/web/tests/visual/replay-board.spec.ts-snapshots/{replay-board-desktop,replay-board-mobile}.png`
- `playwright.config.ts` now sets `snapshotPathTemplate` so the repo no longer depends on `*-win32.png`.
- `tools/check-visual.mjs` now rejects `--update-snapshots` under `CI`, preventing silent rebaseline in automated runs.
- `tools/check-phase4.mjs`, `tools/check-phase5.mjs`, `tools/check-phase6.mjs`, `tools/check-phase7.mjs`, and `tools/check-visual.mjs` now boot the built web app through the standalone server path instead of `next start`.
- `apps/room-service/src/authority.ts` now broadcasts `room.state` to bound viewers whenever seat bindings change, so the remaining player flips between `waiting-opponent` and `active` without waiting for the next gameplay patch.
- `apps/room-service/src/app.test.ts` and `apps/web/tests/phase6/room-boardscene.spec.ts` now gate that room-status cosmetic fanout at integration and browser levels.
- `@axe-core/playwright` plus `pnpm check-a11y` now provide a serious/critical a11y gate for:
    - `/play/local`
    - `/play/ai`
    - `/play/run`
    - `/rooms/[roomId]`
    - `/replays/[replayId]`
- `packages/ui/src/drawer/ai-trace-drawer.tsx` now makes the AI trace list keyboard-focusable, closing the serious `scrollable-region-focusable` issue found by the new harness.

## Touched Files

- `tools/standalone-web-server.mjs`
- `tools/check-phase4.mjs`
- `tools/check-phase5.mjs`
- `tools/check-phase6.mjs`
- `tools/check-phase7.mjs`
- `tools/check-visual.mjs`
- `tools/check-a11y.mjs`
- `playwright.config.ts`
- `apps/room-service/src/authority.ts`
- `apps/room-service/src/app.test.ts`
- `apps/web/tests/phase6/room-boardscene.spec.ts`
- `apps/web/tests/a11y/axe.ts`
- `apps/web/tests/a11y/product-surfaces.spec.ts`
- `apps/web/tests/a11y/replay-surface.spec.ts`
- `packages/ui/src/drawer/ai-trace-drawer.tsx`
- `package.json`
- `pnpm-lock.yaml`

## Validation Evidence

- `pnpm typecheck`
- `pnpm --filter @gem-duel/room-service test`
- `pnpm check-phase4`
- `pnpm check-phase5`
- `pnpm check-phase6`
- `pnpm check-phase7`
- `pnpm check-visual`
- `pnpm check-a11y`

## Remaining Decisions

- App-wide locale routing remains open and requires a URL/default-locale policy decision.
- Desktop packaging beyond the validated shared-shell runtime artifact remains open and requires a dedicated distribution/signing workstream.
