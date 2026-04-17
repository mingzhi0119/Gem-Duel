# Contracts Rules

- Define boundary shapes here first, including `AuthoritativeSnapshot`, `PlayerSnapshot`, `SpectatorSnapshot`, replay envelopes, and effect/hook contracts. 边界形态必须先在这里定义，包括三类 Snapshot、replay envelope 与 effect/hook 契约。
- Keep runtime schemas, inferred types, error models, information-set filtering rules, and protocol docs aligned. 保持运行时 schema、推导类型、错误模型、信息集过滤规则与协议文档一致。
- Keep identifiers, schema fields, event names, and error codes in English only. 标识符、schema 字段、事件名与错误码只使用英文。
- Treat `MessagePack` as the authoritative replay wire format; JSON is debug/export only. `MessagePack` 是权威 replay wire format；JSON 只用于调试与导出。
- Keep the source layout modular: `shared/`, `snapshots.ts`, `replay.ts`, `http.ts`, `websocket.ts`, `openapi.ts`, and `asyncapi.ts` stay the contract truth; `index.ts` is a thin barrel only. 契约源码必须保持模块化：`shared/`、`snapshots.ts`、`replay.ts`、`http.ts`、`websocket.ts`、`openapi.ts` 与 `asyncapi.ts` 才是契约真相，`index.ts` 只能做薄 barrel。
- Keep the runtime barrel safe: `index.ts` may export runtime schemas/types/helpers only, while document-generation entrypoints stay isolated in `@gem-duel/contracts/openapi` and `@gem-duel/contracts/asyncapi`. 运行时 barrel 必须保持安全：`index.ts` 只能导出运行时 schema、类型与 helper，文档生成入口必须隔离在 `@gem-duel/contracts/openapi` 与 `@gem-duel/contracts/asyncapi`。
- Regenerate and verify `generated/openapi/openapi.json` and `generated/asyncapi/asyncapi.yaml` whenever schemas change. 任何 schema 变更后都必须重新生成并校验 `generated/openapi/openapi.json` 与 `generated/asyncapi/asyncapi.yaml`。
- Keep fixtures in `src/__fixtures__/` aligned with generated artifacts and runtime schema tests. `src/__fixtures__/` 下的 fixtures 必须与生成产物和运行时 schema 测试同步。
- Do not pull domain behavior, UI concerns, or infrastructure logic into this package. 禁止把领域行为、UI 关注点或基础设施逻辑拉进此包。
