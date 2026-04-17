# ADR-0001: Greenfield Monorepo Rebuild

## ZH

### 决策

- 采用绿地重写而非旧结构渐进演化。
- 采用 `pnpm + Turborepo` monorepo。
- 采用 `Next.js App Router` 作为主应用，`Electron` 作为桌面壳。
- 采用 `Fastify + WebSocket` 作为首版权威房间服务。
- 采用 `XState v5` 作为核心状态机实现。

### 原因

- 旧项目的 UI、网络、逻辑和运行时边界耦合过深，不适合继续在原结构上修补。
- monorepo 能更好地收束 contracts/domain/engine/application 的单向依赖。

## EN

### Decision

- Use a greenfield rebuild instead of incremental evolution on top of the legacy structure.
- Adopt a `pnpm + Turborepo` monorepo.
- Adopt `Next.js App Router` as the primary shell and `Electron` as the desktop wrapper.
- Adopt `Fastify + WebSocket` for the first authoritative room-service.
- Adopt `XState v5` for the core state-machine implementation.

### Rationale

- The legacy project couples UI, networking, logic, and runtime boundaries too tightly to continue safely.
- A monorepo better enforces one-way dependencies across contracts, domain, engine, and application layers.
