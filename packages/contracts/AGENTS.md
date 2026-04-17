# Contracts Rules

- Define boundary shapes here first, including `AuthoritativeSnapshot`, `PlayerSnapshot`, `SpectatorSnapshot`, replay envelopes, and effect/hook contracts. 边界形态必须先在这里定义，包括三类 Snapshot、replay envelope 与 effect/hook 契约。
- Keep runtime schemas, inferred types, error models, information-set filtering rules, and protocol docs aligned. 保持运行时 schema、推导类型、错误模型、信息集过滤规则与协议文档一致。
- Keep identifiers, schema fields, event names, and error codes in English only. 标识符、schema 字段、事件名与错误码只使用英文。
- Treat `MessagePack` as the authoritative replay wire format; JSON is debug/export only. `MessagePack` 是权威 replay wire format；JSON 只用于调试与导出。
- Do not pull domain behavior, UI concerns, or infrastructure logic into this package. 禁止把领域行为、UI 关注点或基础设施逻辑拉进此包。
