# Room Service Rules

- This app owns authoritative online orchestration, sequence handling, resync, idempotency, spectator delivery, and transport coordination. 此应用负责在线权威编排、序列号处理、resync、幂等、观战投递与传输协调。
- Match truth must come from shared `packages/core-engine`; never fork or reimplement gameplay logic here. 对局真相必须来自共享的 `packages/core-engine`；此处禁止 fork 或重写玩法逻辑。
- Only add authentication, persistence, broadcasting, idempotency, rate limiting, auditing, and information filtering around the shared engine. 围绕共享引擎只允许增加认证、持久化、广播、幂等、限流、审计与信息过滤。
- Always serialize filtered `PlayerSnapshot` or `SpectatorSnapshot`, never raw authoritative state, to external clients. 对外客户端只可下发过滤后的 `PlayerSnapshot` 或 `SpectatorSnapshot`，绝不能下发原始权威状态。
- Keep protocol evolution documented in `docs/30-contracts/` and operational behavior documented in `docs/40-operations/`. 协议演进写入 `docs/30-contracts/`，运行语义写入 `docs/40-operations/`。
