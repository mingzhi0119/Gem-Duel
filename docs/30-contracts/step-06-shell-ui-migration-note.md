# Step 06 Migration Note - Shell/UI Integration

## ZH

- Step 06 的目标不是改规则，而是把 room-service、application、Web shell 与 Desktop shell 收敛到同一套 UI 交互边界。
- 本步允许扩展 room/UI payload，但不改变底层 classic rules、replay authority 或 Step 05 的 server-bound seat 基本语义。

### 迁移内容

- `UiActionDescriptor` 从 TypeScript-only 接口提升为 schema-backed contract，可安全出现在 HTTP / WebSocket payload 中。
- `RoomDetail`、`match.patch`、`match.resync` 与 `match.observe` 需要携带 viewer-scoped `availableActions`。
- `availableActions` 的生成权责属于 `packages/application` 的 `UiViewModel` 投影，不属于 Web 页面、Desktop shell 或 room-service transport 层。
- spectator 与非当前行动玩家的 `availableActions` 必须为空数组，防止壳层误把“可见状态”解释成“可执行权限”。

### 兼容性说明

- Step 06 不 bump `SCHEMA_VERSION`、`ENGINE_VERSION` 或 `RULESET_VERSION`；本步是壳层接线扩展，不是玩法规则迁移。
- `GET /rooms/:roomId` 仍然只能返回 spectator-safe snapshot；Step 06 只是在该响应中补充 spectator-scoped `availableActions: []`。
- WebSocket seat binding、duplicate-command、stale-seq resync 与 replay 存储语义沿用 Step 05。

## EN

- Step 06 does not change gameplay rules. Its goal is to converge room-service, the application layer, the Web shell, and the Desktop shell on the same UI interaction boundary.
- The step may expand room/UI payloads, but it does not revisit classic rules, replay authority, or the Step 05 server-bound seat semantics.

### Migration Surface

- `UiActionDescriptor` is promoted from a TypeScript-only interface into a schema-backed contract so it can travel safely in HTTP / WebSocket payloads.
- `RoomDetail`, `match.patch`, `match.resync`, and `match.observe` now carry viewer-scoped `availableActions`.
- `availableActions` remain the responsibility of the application-layer `UiViewModel` projection rather than Web pages, the Desktop shell, or the room-service transport layer.
- Spectators and non-active players must receive `availableActions: []` so shells never confuse visible state with actionable authority.

### Compatibility Notes

- Step 06 does not bump `SCHEMA_VERSION`, `ENGINE_VERSION`, or `RULESET_VERSION`; this is a shell wiring expansion rather than a gameplay migration.
- `GET /rooms/:roomId` remains spectator-safe only; Step 06 simply adds spectator-scoped `availableActions: []` to that response.
- WebSocket seat binding, duplicate-command handling, stale-seq resync, and replay persistence semantics continue to follow Step 05.
