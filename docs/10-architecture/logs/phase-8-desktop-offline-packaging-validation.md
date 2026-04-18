# Phase 8 Desktop Offline Packaging Validation

Date: 2026-04-18

## Scope

Phase 8 closed the remaining Desktop runtime work after Phase 7:

- replace the invalid `file://...index.html` fallback with a real shared-web-shell startup path;
- validate Desktop build, startup, resource loading, and main-board smoke/e2e against the co-located standalone web build;
- re-close the release-prep wording so Desktop is no longer described as a theoretical shared-shell surface only.

## Landed Results

- `apps/desktop` now starts the co-located Next standalone server whenever `GEM_DUEL_WEB_URL` is absent.
- The Desktop runtime launches `apps/web/.next/standalone/apps/web/server.js` through `ELECTRON_RUN_AS_NODE`, keeping the shared Web shell as the only renderer surface instead of falling back to `file://`.
- Before BrowserWindow startup, Desktop now mirrors `apps/web/.next/static/**` into the standalone target so the shared shell hydrates correctly and serves `/_next/static/*` assets instead of getting stuck on SSR-only HTML.
- The preload bridge is now stabilized as `preload.cjs` plus `sandbox: false`, which makes `desktopShell.getVersion()` available inside the shared web shell and allows the runtime badge to distinguish Desktop from Web.
- `pnpm check-phase8` is now the formal Desktop gate:
    - `pnpm build:web`
    - `pnpm build:desktop`
    - Electron startup over loopback HTTP
    - Desktop bridge availability
    - deterministic classic-local board smoke path on `/play/local?scenario=take-three-linked-gems`

## Touched Files

- `apps/desktop/src/main.ts`
- `apps/desktop/src/preload.cts`
- `apps/desktop/src/web-runtime.ts`
- `apps/desktop/src/web-runtime.test.ts`
- `apps/desktop/tsconfig.json`
- `apps/web/app/components/runtime-shell-badge.tsx`
- `apps/web/tests/phase8/desktop-shell.spec.ts`
- `tools/check-phase8.mjs`
- `package.json`
- `docs/10-architecture/full-board-ui-roadmap.md`
- `docs/40-operations/release-prep.md`

## Validation Evidence

- Full release-facing validation rerun after Phase 8 closeout:
    - `pnpm contracts:generate`
    - `pnpm contracts:verify`
    - `pnpm check-deps`
    - `pnpm check-boundaries`
    - `pnpm check-contracts`
    - `pnpm lint`
    - `pnpm typecheck`
    - `pnpm test`
    - `pnpm build`
    - `pnpm check-phase4`
    - `pnpm check-phase5`
    - `pnpm check-phase6`
    - `pnpm check-phase7`
    - `pnpm check-phase8`
    - `pnpm check-visual`
- `pnpm build:web`
- `pnpm build:desktop`
- `pnpm check-phase8`

Desktop smoke/e2e now proves:

- the Electron shell opens the shared web shell over `http://127.0.0.1:<port>` rather than `file://`;
- the Desktop preload bridge is live in the renderer;
- the shared shell can load client assets and hydrate;
- the Desktop window can complete the frozen classic-local smoke path and reach the expected `finalStateHash` (`fnv1a-32b1c890`).

## Remaining Caveats

- Phase 8 closes the Desktop offline runtime validation tracked by the full-board roadmap; it does **not** create a signed installer, store package, or separate packaging pipeline outside the currently validated co-located artifact shape.
- Several older repo-level checks still boot Web verification through `next start`, which now emits a standalone warning even though the validated Desktop runtime path itself already uses `node .next/standalone/apps/web/server.js`. That tooling hardening remains follow-up work rather than a blocker on Phase 8 closure.
- The repository-wide screenshot policy is still platform-specific (`*-win32.png`), so cross-platform visual-governance hardening remains a later tooling concern rather than open product-phase debt.
