# Room-Service Authority Semantics

## ZH

### Step 05 运行语义

- `apps/room-service` 是在线权威裁判层，只能围绕共享 engine/application 增加连接绑定、广播、幂等、观战投递、房间生命周期与 replay 存储触发。
- Step 05 默认部署形态仍是单进程 `in-memory + seam`；本步不覆盖 Postgres、Redis、跨进程 fanout、多实例恢复或真正的 auth provider。

### 房间生命周期

- `waiting`：房间存在，但绑定玩家少于两名，且比赛尚未完成。
- `active`：两名玩家都已通过 WebSocket `room.join` 完成绑定，比赛尚未完成。
- `completed`：比赛已结束，且 replay 已写入 in-memory replay store。
- `playerCount` 只统计当前 live websocket 绑定的玩家连接，不把 HTTP `/join` shim 视为占位。

### 连接与身份绑定

- 新连接初始为 `unbound`，只允许 `room.join`、`room.watch`、`room.leave`。
- `room.join` 成功后，该 socket 绑定到 `player(p1|p2)`。
- `room.watch` 成功后，该 socket 绑定到 `spectator`。
- `room.leave` 与连接断开都必须释放 binding；如果比赛未结束，房间状态回到 `waiting`。
- 服务端权威 seat 来自 socket binding，不信任客户端 `issuedBy`。

### 广播与重同步

- 玩家成功命令后：
    - 向 `p1` 绑定连接发送 `p1` 视角的 `match.patch`
    - 向 `p2` 绑定连接发送 `p2` 视角的 `match.patch`
    - 向 spectator 连接发送 `match.observe`
- duplicate `clientCommandId` 只返回同一份原始 `match.patch` 给请求方，不再次广播。
- stale `expectedSeq` 只返回 `match.resync` 给请求方，不广播。

### Replay 存储触发

- 比赛进入 terminal / winner 已决时，room-service 立即从共享 `MatchSession` 提取权威 replay bundle 并写入 in-memory replay store。
- `GET /replays/:roomId` 优先读取已存储 replay；若房间尚未结束，则允许返回 live replay bundle 作为调试视图。

### 观测与运维建议

- 关键日志点位：
    - 房间创建
    - `room.join` / `room.watch` / `room.leave`
    - duplicate command hit
    - seq mismatch / resync
    - replay stored
- 关键指标建议：
    - 活跃房间数
    - 活跃 spectator 连接数
    - duplicate-command 命中数
    - resync 次数
    - room error code 计数

## EN

### Step 05 Runtime Semantics

- `apps/room-service` is the authoritative online referee layer and may only add connection binding, broadcasting, idempotency, spectator delivery, room lifecycle handling, and replay persistence triggers around the shared engine/application flow.
- The default Step 05 deployment remains single-process `in-memory + seam`; the step does not cover Postgres, Redis, cross-process fanout, multi-instance recovery, or a real auth provider.

### Room Lifecycle

- `waiting`: the room exists, fewer than two players are websocket-bound, and the match is not finished.
- `active`: both players have completed live WebSocket `room.join` binding and the match is not finished.
- `completed`: the match is finished and the replay has been written into the in-memory replay store.
- `playerCount` counts only live websocket-bound player connections and does not treat the HTTP `/join` shim as a seat claim.

### Connection and Identity Binding

- New connections begin as `unbound` and may send only `room.join`, `room.watch`, or `room.leave`.
- After a successful `room.join`, the socket becomes `player(p1|p2)`.
- After a successful `room.watch`, the socket becomes `spectator`.
- `room.leave` and socket disconnects must both release the binding; if the match is not finished, the room returns to `waiting`.
- Server-side seat authority comes from the socket binding rather than the client-supplied `issuedBy` field.

### Broadcast and Resync

- After a successful player command:
    - send a `p1`-filtered `match.patch` to the `p1` binding
    - send a `p2`-filtered `match.patch` to the `p2` binding
    - send `match.observe` to spectator bindings
- Duplicate `clientCommandId` submissions return the same original `match.patch` to the requester only and do not rebroadcast.
- Stale `expectedSeq` submissions return `match.resync` to the requester only and do not broadcast.

### Replay Persistence Trigger

- When the match enters terminal state / a winner is decided, room-service immediately extracts the authoritative replay bundle from the shared `MatchSession` and stores it in the in-memory replay store.
- `GET /replays/:roomId` reads the stored replay first; if the room is still live, it may return the live replay bundle as a debug view.

### Observability Guidance

- Key log points:
    - room creation
    - `room.join` / `room.watch` / `room.leave`
    - duplicate-command hits
    - seq mismatch / resync
    - replay stored
- Suggested metrics:
    - active room count
    - active spectator connection count
    - duplicate-command hit count
    - resync count
    - room error code counts
