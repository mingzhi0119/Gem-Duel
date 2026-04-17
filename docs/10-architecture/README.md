# Architecture

## ZH

- 以 monorepo 为唯一组织方式，不再把应用、规则和桌面壳混放在单一 `src/`。
- Web、Desktop、Room Service 都通过 `application` 与 `contracts` 使用核心引擎。
- 任何新包都必须说明依赖方向和可见边界。
- 工程执行规范、legacy 归档规则与 Git 策略请参考 [`engineering-standards.md`](./engineering-standards.md)。
- Agent 边界、分层 `AGENTS.md` 与机械化护栏矩阵请参考 [`agent-guardrails-matrix.md`](./agent-guardrails-matrix.md)。

## EN

- The monorepo is now the only supported code organization model.
- Web, Desktop, and Room Service all consume the core engine through `application` and `contracts`.
- Every new package must document its dependency direction and visibility boundary.
- See [`engineering-standards.md`](./engineering-standards.md) for execution rules, legacy archive policy, and Git workflow constraints.
- See [`agent-guardrails-matrix.md`](./agent-guardrails-matrix.md) for agent boundaries, layered `AGENTS.md`, and the mechanical guardrail matrix.
