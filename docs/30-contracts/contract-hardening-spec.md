# Contract Hardening Spec

## ZH

本文件定义 `packages/contracts` 的治理硬化方向。契约必须同时满足运行时校验、类型推导、文档生成和回归快照。

## 单一真相源

- `zod` 作为当前默认的 schema 真相源。
- TypeScript 类型必须从 schema 推导，而不是反向手写镜像类型。
- 错误码、Problem Details 结构和事件名必须在契约层统一声明。

## 契约输出

- HTTP 契约：通过 `@asteasolutions/zod-to-openapi` 生成 OpenAPI。
- WebSocket / event 契约：采用 `AsyncAPI` 作为目标描述格式。
- Replay 契约：当前重构阶段先采用 `JSON + JSON Schema`，待 wire format 稳定后再评估 Protobuf 或二进制格式。
- HTTP 错误表达：对齐 `RFC 9457 Problem Details for HTTP APIs`。

## 修改顺序

- 先改 schema。
- 再改错误码说明与契约文档。
- 再更新生成产物与快照。
- 最后才允许改调用方与实现层。

## 回归要求

- 所有公共 HTTP、WebSocket、Replay 消息都应有快照或 fixture。
- 快照变化必须在 `docs/30-contracts/` 和对应 ADR 中说明是“预期变更”还是“破坏性变更”。
- 契约层不允许绕过 schema 直接定义跨边界 payload。

## EN

This document defines the hardening path for `packages/contracts`. Contracts must support runtime validation, type inference, generated documentation, and regression snapshots at the same time.

## Single Source of Truth

- `zod` is the current default schema source of truth.
- TypeScript types must be inferred from schemas rather than maintained as hand-written mirror types.
- Error codes, Problem Details shapes, and event names must be declared centrally in the contract layer.

## Contract Outputs

- HTTP contracts: generate OpenAPI through `@asteasolutions/zod-to-openapi`.
- WebSocket / event contracts: use `AsyncAPI` as the target description format.
- Replay contracts: use `JSON + JSON Schema` during the rebuild phase, then evaluate Protobuf or another binary format after the wire format stabilizes.
- HTTP error representation: align with `RFC 9457 Problem Details for HTTP APIs`.

## Change Order

- Change the schema first.
- Then update error-code references and contract docs.
- Then update generated artifacts and snapshots.
- Only then may callers and implementation layers change.

## Regression Requirements

- All public HTTP, WebSocket, and replay messages should have snapshots or fixtures.
- Snapshot changes must be explained in `docs/30-contracts/` and the matching ADR as either expected or breaking.
- The contract layer may not bypass schemas when defining cross-boundary payloads.
