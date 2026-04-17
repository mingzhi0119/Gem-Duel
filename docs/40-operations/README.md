# Operations

## ZH

- 默认部署为厂商中立容器化：Web、Room Service、Postgres、Redis 分离部署。
- CI/CD 默认采用 `pnpm + turbo`。
- 日志、指标、trace、告警点位应优先落在 room-service 与关键 BFF 路由。
- Agent 护栏工具、pre-commit/commit gate 与 `.codex`/MCP 规划请参考 [`agent-tooling-rollout.md`](./agent-tooling-rollout.md)。
- 项目本地 Skills 的质量标准、步骤映射与目录约束请参考 [`skills-governance.md`](./skills-governance.md)。

## EN

- The default deployment target is vendor-neutral containerized infrastructure: Web, Room Service, Postgres, and Redis deployed separately.
- CI/CD defaults to `pnpm + turbo`.
- Logs, metrics, traces, and alert points should be introduced first in room-service and critical BFF routes.
- See [`agent-tooling-rollout.md`](./agent-tooling-rollout.md) for agent guardrail tooling, pre-commit/commit gates, and `.codex`/MCP planning.
- See [`skills-governance.md`](./skills-governance.md) for the quality bar, step mapping, and directory rules for project-local skills.
