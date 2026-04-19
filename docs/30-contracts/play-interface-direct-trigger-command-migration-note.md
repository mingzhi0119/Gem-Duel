# Play Interface Direct-Trigger Command Migration Note

Date: 2026-04-19

## ZH

- 本迁移说明记录 2026-04-19 的 play-interface command surface breaking change。
- 目标不是新增规则，而是把产品壳从 `BEGIN_*` 模式门改成 direct-trigger 交互，并让 replay/schema 明确声明这次不兼容更新。

### 迁移内容

- `GameCommand` 移除：
    - `BEGIN_GEM_SELECTION`
    - `BEGIN_RESERVE`
    - `BEGIN_BUY`
    - `BEGIN_PRIVILEGE`
- 公开 `GamePhase` 移除：
    - `reserving`
    - `buying`
- 从 `turnIdle` 直接合法的产品级命令变为：
    - `TAKE_TOKENS_ADD_POSITION`
    - `BUY_CARD`
    - `RESERVE_CARD`
    - `USE_PRIVILEGE_ADD_POSITION`（仅在 privilege window 可用时）
- 多步选择仍使用：
    - `TAKE_TOKENS_CONFIRM` / `TAKE_TOKENS_CANCEL`
    - `USE_PRIVILEGE_CONFIRM` / `USE_PRIVILEGE_CANCEL`
- 低层 continuation command `TAKE_TOKENS` / `USE_PRIVILEGE` 仍存在于引擎内部续步语义中，但不再作为产品壳从 `turnIdle` 暴露的“先选模式再执行”入口。

### 版本与兼容性

- `SCHEMA_VERSION` 已 bump 到 `7.0.0`。
- `ENGINE_VERSION` 已 bump 到 `2026.04-step8`。
- 本波属于 **schema major + engine semantic** 共同变化：
    - `commands[]` 里的旧 `BEGIN_*` stream 不再承诺与新 product shell 向前兼容；
    - `events[]` 仍是 replay 的 authority truth；
    - 旧 replay 若只用于审阅/debug，可保留原 bundle；若要在新基线上验证 deterministic legality，需要迁移或重录。

### 受影响的消费者

- `apps/web`
- `apps/desktop`
- `packages/application`
- `apps/room-service`
- replay fixtures / golden bundles
- AI deterministic baselines

### 迁移要求

- 页面、Drawer、SessionRail 与任何 host shell 不得再把 `BEGIN_*` 当作产品按钮渲染。
- 所有 board / market / royal 热区必须直接映射到 direct-trigger command。
- replay / fixture / test 如果仍保留 `BEGIN_*`，必须：
    - 说明它是旧 schema evidence；或
    - 迁移为 `*_ADD_POSITION + *_CONFIRM` / direct one-shot command 流。

## EN

- This migration note records the 2026-04-19 breaking change to the play-interface command surface.
- The goal is not to add new rules; it is to replace the product shell's `BEGIN_*` mode gate with direct-trigger interaction and to mark replay/schema compatibility accordingly.

### Migration Surface

- Remove these `GameCommand` entries:
    - `BEGIN_GEM_SELECTION`
    - `BEGIN_RESERVE`
    - `BEGIN_BUY`
    - `BEGIN_PRIVILEGE`
- Remove these public `GamePhase` values:
    - `reserving`
    - `buying`
- The product-facing commands now legal directly from `turnIdle` are:
    - `TAKE_TOKENS_ADD_POSITION`
    - `BUY_CARD`
    - `RESERVE_CARD`
    - `USE_PRIVILEGE_ADD_POSITION` (only when the privilege window is actually available)
- Multi-step selection still uses:
    - `TAKE_TOKENS_CONFIRM` / `TAKE_TOKENS_CANCEL`
    - `USE_PRIVILEGE_CONFIRM` / `USE_PRIVILEGE_CANCEL`
- The low-level continuation commands `TAKE_TOKENS` / `USE_PRIVILEGE` still exist for engine-owned follow-through semantics, but they are no longer the public “select mode first, then execute” entrypoint exposed from `turnIdle`.

### Versioning and Compatibility

- `SCHEMA_VERSION` is now `7.0.0`.
- `ENGINE_VERSION` is now `2026.04-step8`.
- This wave is both a **schema-major** and an **engine-semantic** change:
    - old `BEGIN_*` command streams inside `commands[]` are no longer guaranteed to remain forward-compatible with the new product shell;
    - `events[]` remain the authoritative replay truth;
    - old replays may remain as historical/debug evidence, but deterministic verification on the new baseline requires migration or recapture.

### Affected Consumers

- `apps/web`
- `apps/desktop`
- `packages/application`
- `apps/room-service`
- replay fixtures / golden bundles
- AI deterministic baselines

### Migration Requirement

- Pages, drawers, the session rail, and every host shell must stop rendering `BEGIN_*` as product-facing buttons.
- Board, market, and royal hotspots must map directly onto the new direct-trigger commands.
- Any replay / fixture / test that still contains `BEGIN_*` must either:
    - document itself as old-schema evidence; or
    - migrate to the `*_ADD_POSITION + *_CONFIRM` / direct one-shot flow.
