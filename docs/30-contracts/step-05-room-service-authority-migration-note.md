# Step 05 Room-Service Authority Migration Note

## ZH

### 变更摘要

- Step 05 不新增 HTTP / WebSocket 公共字段，也不变更三类 Snapshot 的 wire shape。
- 本步收紧的是在线协议语义：room ownership、seat binding、幂等缓存、seq mismatch 的 resync 行为，以及玩家 / spectator 的信息过滤责任边界。

### 兼容性结论

- `SCHEMA_VERSION`：不变。
- `ENGINE_VERSION`：不变。
- `RULESET_VERSION`：不变。
- OpenAPI / AsyncAPI：预期无 schema 形状漂移；若生成产物变化，应仅来自文档摘要或排序差异，而非 payload 结构扩展。

### Step 05 语义冻结

- `POST /rooms` 只创建房间与权威 session，不自动占位任何玩家连接。
- `GET /rooms/:roomId` 只返回 public / spectator-safe `RoomDetail`，不得暴露玩家私有视角。
- `room.join` 是唯一权威的实时 seat claim；`POST /rooms/:roomId/join` 仅保留兼容 shim，不建立 live websocket binding。
- `match.command.command.issuedBy` 继续保留在契约里用于兼容与 replay intent，但服务端权威实现必须忽略它的 seat authority，实际命令归属由 socket 绑定的玩家座位决定。
- duplicate `clientCommandId` 必须返回同一份原始 `match.patch` 给请求方，不推进状态，也不再次广播。
- stale `expectedSeq` 必须返回 `match.resync`，带当前完整的 viewer-filtered snapshot；这不是 `room.error` 分支。
- spectator 只能接收 `room.state` 与后续 `match.observe`，不得收到玩家私有 `match.patch` 视角。

### Step 05 房间错误码

- `ROOM_NOT_FOUND` → `validation`
- `ROOM_FULL` → `conflict`
- `ROOM_SEAT_TAKEN` → `conflict`
- `ROOM_BINDING_REQUIRED` → `authz`
- `ROOM_COMMAND_FORBIDDEN` → `authz`
- `ROOM_ALREADY_BOUND` → `conflict`
- `ROOM_WAITING_FOR_PLAYERS` → `conflict`

## EN

### Summary

- Step 05 does not add new public HTTP / WebSocket fields and does not change the wire shape of the three snapshot tiers.
- The step tightens online protocol semantics instead: room ownership, seat binding, idempotency caching, seq-mismatch resync behavior, and the information-filtering boundary between players and spectators.

### Compatibility Outcome

- `SCHEMA_VERSION`: unchanged.
- `ENGINE_VERSION`: unchanged.
- `RULESET_VERSION`: unchanged.
- OpenAPI / AsyncAPI: no schema-shape drift is expected; any generated diff should be limited to documentation text or ordering, not payload expansion.

### Step 05 Semantic Freeze

- `POST /rooms` creates the room and authoritative session only and does not auto-claim any player binding.
- `GET /rooms/:roomId` returns public / spectator-safe `RoomDetail` only and may never leak a player-private view.
- `room.join` is the sole authoritative live seat-claim path; `POST /rooms/:roomId/join` remains a compatibility shim only and does not establish a live websocket binding.
- `match.command.command.issuedBy` remains in the contract for compatibility and replay intent, but the authoritative server implementation must ignore it for seat authority; actual command ownership comes from the socket-bound player seat.
- Duplicate `clientCommandId` values must return the same original `match.patch` to the requester without advancing state or rebroadcasting.
- Stale `expectedSeq` values must return `match.resync` with the full current viewer-filtered snapshot; this is not a `room.error` branch.
- Spectators may receive `room.state` and later `match.observe` only, and may never receive player-private `match.patch` views.

### Step 05 Room Error Codes

- `ROOM_NOT_FOUND` → `validation`
- `ROOM_FULL` → `conflict`
- `ROOM_SEAT_TAKEN` → `conflict`
- `ROOM_BINDING_REQUIRED` → `authz`
- `ROOM_COMMAND_FORBIDDEN` → `authz`
- `ROOM_ALREADY_BOUND` → `conflict`
- `ROOM_WAITING_FOR_PLAYERS` → `conflict`
