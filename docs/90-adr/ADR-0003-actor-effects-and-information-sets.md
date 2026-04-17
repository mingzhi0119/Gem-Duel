# ADR-0003: Actor Effects, Information Sets, and Replay Streams

## ZH

### 决策

- 连锁效果、Royal 奖励、extra turn 与 Buff hook 统一采用 `XState v5 actor model` 建模。
- Snapshot 分成 `AuthoritativeSnapshot`、`PlayerSnapshot`、`SpectatorSnapshot` 三层，并通过信息过滤投影对外发送。
- Replay 的权威 wire format 采用 `MessagePack`，推荐实现库记录为 `msgpackr`。
- 随机性统一采用 namespaced RNG streams，标准接口固定为 `fork(namespace: string)`。
- `apps/room-service` 必须复用共享 `packages/core-engine`，不得实现第二份服务端规则引擎。

### 原因

- Splendor Duel 的购卡能力、Royal 与 extra turn 不是简单 phase 切换，更适合 actor 生命周期与连锁事件流。
- 在线权威模式若不区分权威快照、玩家快照与观战快照，会直接泄露隐藏信息。
- replay 需要既能做机器级确定性回归，又能压缩存储与传输体积，因此采用二进制权威格式更稳妥。
- namespaced RNG streams 可以避免不同子系统因随机调用次数变化而互相污染。

## EN

### Decision

- Chained effects, royal rewards, extra turns, and Buff hooks use `XState v5 actor model` as the single modeling approach.
- Snapshots are split into `AuthoritativeSnapshot`, `PlayerSnapshot`, and `SpectatorSnapshot`, with outbound delivery always going through information-filtering projections.
- The authoritative replay wire format is `MessagePack`, with `msgpackr` recorded as the preferred implementation library.
- Randomness uses namespaced RNG streams, standardized on `fork(namespace: string)`.
- `apps/room-service` must reuse the shared `packages/core-engine` and may not implement a second server-side rules engine.

### Rationale

- Splendor Duel buy abilities, royal rewards, and extra turns are not simple phase switches and fit actor lifecycles plus chained event streams better.
- Authoritative online play must distinguish referee snapshots, player views, and spectator views to avoid leaking hidden information.
- Replay needs both machine-grade determinism regression and compact storage/transport, making a binary authoritative format the safer choice.
- Namespaced RNG streams prevent subsystems from contaminating one another when random call counts change.
