# Contracts

## ZH

- 所有 HTTP、WebSocket、Replay 和 UI 对外形态都在 `packages/contracts` 定义。
- Zod schema 是运行时真相，TypeScript 类型由 schema 推导。
- OpenAPI 源对象也从这里生成，外部系统不得绕过该层。
- 运行时 root barrel `@gem-duel/contracts` 只暴露运行时安全的 schema、类型与投影函数；文档生成入口改走 `@gem-duel/contracts/openapi` 与 `@gem-duel/contracts/asyncapi`。
- 生成产物固定提交到 `packages/contracts/generated/openapi/openapi.json` 与 `packages/contracts/generated/asyncapi/asyncapi.yaml`。
- 契约 drift 校验命令：`pnpm contracts:verify`；完整契约检查命令：`pnpm check-contracts`。
- 契约硬化、Problem Details、AsyncAPI 与 snapshot 要求请参考 [`contract-hardening-spec.md`](./contract-hardening-spec.md)。
- 三类 Snapshot、effect/hook 契约、MessagePack replay 与在线协议字段也以 [`contract-hardening-spec.md`](./contract-hardening-spec.md) 为准。
- Step 03 对 `royalResolution` phase surface 与 replay/hash ownership 的破坏性变更说明请参考 [`step-03-phase-replay-migration-note.md`](./step-03-phase-replay-migration-note.md)。
- Step 04 对 classic command surface、snapshot shape 与 victory metadata 的迁移说明请参考 [`step-04-classic-rules-migration-note.md`](./step-04-classic-rules-migration-note.md)。
- Step 05 对 room-service authority、server-bound seat、seq/resync 与 room error semantics 的迁移说明请参考 [`step-05-room-service-authority-migration-note.md`](./step-05-room-service-authority-migration-note.md)。
- Step 06 对 shared shell/UI integration、viewer-scoped `availableActions` 与 room/UI payload 扩展的迁移说明请参考 [`step-06-shell-ui-migration-note.md`](./step-06-shell-ui-migration-note.md)。
- Step 07 对 run/buff contract surface、snapshot `runContext` 与 replay inspector vertical slice 的迁移说明请参考 [`step-07-run-buff-replay-migration-note.md`](./step-07-run-buff-replay-migration-note.md)。

## EN

- All HTTP, WebSocket, replay, and outward UI shapes are defined in `packages/contracts`.
- Zod schemas are the runtime source of truth; TypeScript types are inferred from them.
- The OpenAPI source object also lives here and may not be bypassed by external systems.
- The runtime root barrel `@gem-duel/contracts` exposes runtime-safe schemas, types, and projection helpers only; document-generation entrypoints live at `@gem-duel/contracts/openapi` and `@gem-duel/contracts/asyncapi`.
- Generated artifacts are committed under `packages/contracts/generated/openapi/openapi.json` and `packages/contracts/generated/asyncapi/asyncapi.yaml`.
- Contract drift verification runs through `pnpm contracts:verify`, while the full contract check runs through `pnpm check-contracts`.
- See [`contract-hardening-spec.md`](./contract-hardening-spec.md) for contract hardening, Problem Details, AsyncAPI, and snapshot requirements.
- Snapshot tiers, effect/hook contracts, MessagePack replay rules, and online protocol fields also follow [`contract-hardening-spec.md`](./contract-hardening-spec.md).
- See [`step-03-phase-replay-migration-note.md`](./step-03-phase-replay-migration-note.md) for the Step 03 breaking changes to the public phase surface and replay/hash ownership.
- See [`step-04-classic-rules-migration-note.md`](./step-04-classic-rules-migration-note.md) for the Step 04 migration of the classic command surface, snapshot shape, and victory metadata.
- See [`step-05-room-service-authority-migration-note.md`](./step-05-room-service-authority-migration-note.md) for the Step 05 migration of room-service authority, server-bound seats, seq/resync, and room-error semantics.
- See [`step-06-shell-ui-migration-note.md`](./step-06-shell-ui-migration-note.md) for the Step 06 migration of shared shell/UI integration, viewer-scoped `availableActions`, and the room/UI payload expansion.
- See [`step-07-run-buff-replay-migration-note.md`](./step-07-run-buff-replay-migration-note.md) for the Step 07 migration of the run/buff contract surface, snapshot `runContext`, and the replay-inspector vertical slice.
