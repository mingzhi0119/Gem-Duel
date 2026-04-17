# Operations

## ZH

- 默认部署为厂商中立容器化：Web、Room Service、Postgres、Redis 分离部署。
- CI/CD 默认采用 `pnpm + turbo`。
- 日志、指标、trace、告警点位应优先落在 room-service 与关键 BFF 路由。

## EN

- The default deployment target is vendor-neutral containerized infrastructure: Web, Room Service, Postgres, and Redis deployed separately.
- CI/CD defaults to `pnpm + turbo`.
- Logs, metrics, traces, and alert points should be introduced first in room-service and critical BFF routes.
