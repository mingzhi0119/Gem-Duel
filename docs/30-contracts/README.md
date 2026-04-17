# Contracts

## ZH

- 所有 HTTP、WebSocket、Replay 和 UI 对外形态都在 `packages/contracts` 定义。
- Zod schema 是运行时真相，TypeScript 类型由 schema 推导。
- OpenAPI 源对象也从这里生成，外部系统不得绕过该层。

## EN

- All HTTP, WebSocket, replay, and outward UI shapes are defined in `packages/contracts`.
- Zod schemas are the runtime source of truth; TypeScript types are inferred from them.
- The OpenAPI source object also lives here and may not be bypassed by external systems.
