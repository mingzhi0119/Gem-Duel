# Operations

## ZH

- 默认部署为厂商中立容器化：Web、Room Service、Postgres、Redis 分离部署。
- CI/CD 默认采用 `pnpm + turbo`。
- 日志、指标、trace、告警点位应优先落在 room-service 与关键 BFF 路由。
- 发布前检查、产物范围与 Step 08 的 tag 约束请参考 [`release-prep.md`](./release-prep.md)。
- Step 05 的 room-service 权威语义、连接绑定、广播、resync 与 replay 存储触发请参考 [`room-service-authority-semantics.md`](./room-service-authority-semantics.md)。
- Agent 护栏工具、pre-commit/commit gate 与 `.codex`/MCP 规划请参考 [`agent-tooling-rollout.md`](./agent-tooling-rollout.md)。
- 项目本地 Skills 的质量标准、步骤映射与目录约束请参考 [`skills-governance.md`](./skills-governance.md)。

## EN

- The default deployment target is vendor-neutral containerized infrastructure: Web, Room Service, Postgres, and Redis deployed separately.
- CI/CD defaults to `pnpm + turbo`.
- Logs, metrics, traces, and alert points should be introduced first in room-service and critical BFF routes.
- See [`release-prep.md`](./release-prep.md) for release-prep checks, artifact scope, and the Step 08 tag constraint.
- See [`room-service-authority-semantics.md`](./room-service-authority-semantics.md) for the Step 05 room-service authority semantics, connection binding flow, broadcast/resync rules, and replay persistence trigger.
- See [`agent-tooling-rollout.md`](./agent-tooling-rollout.md) for agent guardrail tooling, pre-commit/commit gates, and `.codex`/MCP planning.
- See [`skills-governance.md`](./skills-governance.md) for the quality bar, step mapping, and directory rules for project-local skills.
