# ADR-0007: Target-First Play Shell and Direct-Trigger Commands

### Decision

- Adopt `TargetUI.png` as the desktop source of truth for the active match shell, while keeping `GemDuel-Dev/` as a read-only preview reference only.
- Replace the product shell's `BEGIN_*` interaction gate with direct-trigger commands and engine-owned pending-selection semantics.
- Require active-match routes to render through a landscape-first, viewport-filling shared shell on common `16:9` and `16:10` desktop screens.
- Keep `Save / Load` absent from the product shell until a real persistence/import-export contract exists.

### Rationale

- The old `BEGIN_GEM_SELECTION` / `BEGIN_BUY` / `BEGIN_RESERVE` / `BEGIN_PRIVILEGE` pattern creates redundant UX friction because it asks users to select a mode before touching the real hotspot.
- The engine already owns prompt legality and pending selection, so the product shell should project that truth directly instead of layering a page-local mode machine on top.
- The centered-width-clamp shell visibly underuses desktop space and diverges from the reference target, especially on `16:9` / `16:10` viewports where the arena previously looked like a narrow column surrounded by empty gutters.
- A target-first shell is compatible with the repo's architecture only if the shell stays presentation-only and the authoritative interaction truth remains in contracts/application/core-engine rather than moving into page code.

### Consequences

- `SCHEMA_VERSION` and `ENGINE_VERSION` must move together with the command-surface rewrite because replay/debug `commands[]` compatibility changes.
- Public `GameCommand` no longer exposes `BEGIN_GEM_SELECTION`, `BEGIN_RESERVE`, `BEGIN_BUY`, or `BEGIN_PRIVILEGE`; public `GamePhase` no longer exposes `reserving` or `buying`.
- Active-match consumers in Web, Desktop, room-service-derived views, replay fixtures, and deterministic AI baselines all need synchronized updates.
- `?shell=debug` remains available for regression triage, but it is no longer the primary product-facing interaction model.
- Future fidelity work against `TargetUI.png` should continue as presentation refinement, not as another round of page-local interaction state.
