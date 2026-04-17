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

## EN

- All HTTP, WebSocket, replay, and outward UI shapes are defined in `packages/contracts`.
- Zod schemas are the runtime source of truth; TypeScript types are inferred from them.
- The OpenAPI source object also lives here and may not be bypassed by external systems.
- The runtime root barrel `@gem-duel/contracts` exposes runtime-safe schemas, types, and projection helpers only; document-generation entrypoints live at `@gem-duel/contracts/openapi` and `@gem-duel/contracts/asyncapi`.
- Generated artifacts are committed under `packages/contracts/generated/openapi/openapi.json` and `packages/contracts/generated/asyncapi/asyncapi.yaml`.
- Contract drift verification runs through `pnpm contracts:verify`, while the full contract check runs through `pnpm check-contracts`.
- See [`contract-hardening-spec.md`](./contract-hardening-spec.md) for contract hardening, Problem Details, AsyncAPI, and snapshot requirements.
- Snapshot tiers, effect/hook contracts, MessagePack replay rules, and online protocol fields also follow [`contract-hardening-spec.md`](./contract-hardening-spec.md).
