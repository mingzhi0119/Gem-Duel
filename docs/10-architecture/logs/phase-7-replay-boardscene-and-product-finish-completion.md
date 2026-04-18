# Phase 7 Replay BoardScene and Product-Finish Completion

Date: 2026-04-18

## Scope

Phase 7 closed the replay/product-finish work that remained after Phase 6:

- move `/replays/[replayId]` onto the shared `BoardScene`;
- make replay timeline/hash navigation first-class instead of a detached drawer-only flow;
- add browser and visual gates for replay, keyboard navigation, and small-screen rendering;
- externalize replay/shared-board strings into a bilingual UI catalog without reopening contracts.

## Landed Results

- `/replays/[replayId]` now renders a client replay surface that reuses the shared `BoardScene` as the main stage, while `ReplayDrawer` becomes a controlled sidecar timeline.
- Replay supports:
    - current-step hash in the main board badge;
    - previous / next timeline buttons;
    - direct step selection;
    - keyboard stepping via `ArrowLeft`, `ArrowRight`, `Home`, and `End`.
- Shared UI copy for replay and board-scene chrome now flows through a package-owned bilingual catalog (`en` / `zh`) instead of remaining inline-only.
- The replay board root now carries localized `lang` metadata and named navigation/region affordances so browser-level accessibility assertions can target the shared surface directly.
- Responsive polish landed for the shared shell:
    - tighter board-cell sizing on small screens;
    - stacked board layout at narrow widths;
    - replay mobile screenshot baseline committed.
- Replay browser and visual gates now use a fixture-backed replay HTTP surface through `ROOM_SERVICE_URL`, so the product route stays on the real proxy/contract boundary while tests remain deterministic.

## Touched Files

- `apps/web/app/replays/[replayId]/page.tsx`
- `apps/web/app/replays/[replayId]/replay-client.tsx`
- `packages/application/src/replay/inspector.ts`
- `packages/application/src/shared/types.ts`
- `packages/ui/src/drawer/replay-drawer.tsx`
- `packages/ui/src/views/board-scene.tsx`
- `packages/ui/src/views/terminal-overlay.tsx`
- `packages/ui/src/i18n/messages.ts`
- `packages/ui/src/styles/shell.css`
- `apps/web/tests/phase7/*`
- `apps/web/tests/visual/replay-board.spec.ts*`
- `tools/replay-fixture-server.mjs`
- `tools/check-phase7.mjs`
- `tools/check-visual.mjs`

## Evidence and Rebaseline Notes

- `check-phase7` now proves:
    - replay route uses the shared `BoardScene`;
    - timeline/hash controls remain interactive and deterministic;
    - keyboard stepping works;
    - locale-aware labels render on the replay surface.
- `check-visual` now includes replay desktop/mobile baselines.
- This phase required a screenshot rebaseline for:
    - the new replay board scenes;
    - the Phase 4 local-board snapshot;
    - the `classic-selection` playground scene.

Reason:

- shared shell chrome changed after the replay product-finish pass added localized board-scene/replay controls, focus-visible styles, and responsive spacing adjustments.

Final regression proof:

- after rebaseline, `pnpm check-visual` passed without snapshot updates.

## Remaining Caveats

- Phase 7 closes replay/shared-board accessibility and bilingual UI at the product-surface level; it does **not** introduce app-wide locale routing or a repository-wide `axe-core` harness.
- The committed screenshot policy is still platform-specific (`*-win32.png`), so cross-platform visual-governance hardening remains a later tooling concern.
- Desktop offline validation remains a separate Phase 8 concern and is not implied by this closure.
- `next start` still warns about the repository’s standalone output mode; the replay/browser gates succeed despite that warning, but Phase 8 should revisit the startup path holistically.

## Validation

- `pnpm lint`
- `pnpm typecheck`
- `pnpm check-phase7`
- `pnpm check-visual -- --update-snapshots`
- `pnpm check-visual`
