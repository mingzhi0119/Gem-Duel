# Gem Duel Agent Rules

## MUST / 必须

- Update `packages/contracts` and the matching docs before changing any cross-boundary behavior.
- Update `docs/` or an ADR before adding a new package, layer, dependency direction, or governance rule.
- Keep imports one-way: `contracts/domain -> core-engine -> application -> adapters -> apps/ui`.
- Keep `packages/core-engine` and `packages/domain` deterministic: no time, randomness, IO, browser APIs, Electron APIs, or host state.
- Keep `apps/web`, `apps/desktop`, and `packages/ui` free of game-rule, scoring, Buff, and authority logic.
- Keep `apps/web/app/api/*` limited to BFF, translation, aggregation, and orchestration; never place match resolution there.
- Treat `old/legacy-vite-electron/` as read-only reference only: never import it, never copy it verbatim, never promote it into active architecture.
- Update the tracker, the matching step log, and the change boundary together whenever a rebuild step meaningfully changes.
- Keep governance docs bilingual in the same file; preserve English identifiers for terms, events, and error codes.

## SHOULD / 应当

- Prefer one small, intention-revealing change per step boundary.
- Add tests, replay samples, and contract examples together with new rules or protocol changes.
- Put detailed process rules in `docs/` when they are not yet mechanically enforceable in CI.
- Prefer the closest directory `AGENTS.md` for local constraints and keep root rules short.

## INFO / 说明

- `AGENTS.md` is the short operational summary. Mechanically enforceable policy belongs in tooling and CI; longer rationale belongs in `docs/`.
- Subdirectory `AGENTS.md` files may tighten local constraints but must not weaken the root rules.
- `old/legacy-vite-electron/` stays in place until `Step 08` is accepted.

## COMMANDS / 命令

- Current validation: `pnpm lint`
- Current validation: `pnpm typecheck`
- Current validation: `pnpm test`
- Current validation: `pnpm build`
- Current docs reference: `docs/00-refactor/rebuild-execution-tracker.md`
- Planned guardrails for later steps: `pnpm check-deps`
- Planned guardrails for later steps: `pnpm check-contracts`
- Planned guardrails for later steps: `pnpm check-replays`
- Planned guardrails for later steps: `pnpm check-commit`

## NEVER DO / 禁止

- Never import from `old/legacy-vite-electron/`.
- Never add `Math.random()`, `Date.now()`, `new Date()`, `performance.now()`, `fetch`, `WebSocket`, `window`, `document`, or host IO inside `packages/core-engine` or `packages/domain`.
- Never add game rule logic to `apps/web/app/api/*`.
- Never modify contracts without updating schema docs, error-code references, and the contract governance docs.
- Never create or update git tags before rebuild completion.

## PROOF OF DONE / 完成证明

- The relevant tracker row and step log reflect the change.
- The nearest `AGENTS.md` and the matching governance docs stay consistent.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass when the change requires validation.
- Any planned mechanical guardrail affected by the change is documented in `docs/` even if the tool wiring lands later.
