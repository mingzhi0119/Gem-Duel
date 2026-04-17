# Web/Desktop Application Integration

## ZH

- Step 06 起，Web 与 Desktop 不应各自维护一套“本地按钮逻辑 / 在线按钮逻辑 / spectator 过滤逻辑”。
- 统一原则是：
    - `packages/application` 负责把 authoritative snapshot 或 visible snapshot 组合成共享 `UiViewModel`；
    - `packages/ui` 只负责展示 `UiViewModel` 与交互回调；
    - `apps/web` 负责路由、BFF、浏览器 transport 与页面状态；
    - `apps/desktop` 只负责 Electron 壳、桥接与载入 Web shell。
- 若在线模式需要额外的 UI command boundary，应优先由 room-service 通过 application-projected `availableActions` 下发，而不是让客户端重新推断隐藏 deck、seat ownership 或 turn ownership。
- Desktop 对 shared app layer 的消费方式是加载同一套 Web routes / UI 组合，而不是复制一套桌面专属玩法 renderer。

### 当前基线与后续演进

- 当前 `packages/ui` 默认暴露的是最小验证壳：snapshot 摘要、action list、event log 与 replay inspector。
- 这条边界在 Step 06 已经成立，但它不等同于“完整盘面 UI 已完成”。
- 审计后应按更严格口径理解 Desktop：
    - 当前文档确认的是 Desktop 通过同一套 Web routes / shared UI composition 消费 shared app layer 的边界方向；
    - 当前文档不把 offline standalone / `file://` fallback 视为已验收的产品分发能力；
    - Desktop offline 分发、资源加载与 build/runtime 约束后续统一进入 [`full-board-ui-roadmap.md`](./full-board-ui-roadmap.md) Phase 8。
- 后续若要把 `/play/local`、`/play/ai`、`/play/run` 与 `/rooms/[roomId]` 演进为完整盘面：
    - 先扩 contracts / application projection；
    - 再扩 `packages/ui` 的 board primitives；
    - 最后替换各 shell 的主画面组合。
- 详细分步计划见 [`full-board-ui-roadmap.md`](./full-board-ui-roadmap.md)。

## EN

- Starting in Step 06, Web and Desktop should no longer maintain separate copies of local-action logic, online-action logic, or spectator filtering logic.
- The shared rule is:
    - `packages/application` composes authoritative or visible snapshots into the shared `UiViewModel`;
    - `packages/ui` renders the `UiViewModel` and interaction callbacks only;
    - `apps/web` owns routing, BFF work, browser transport, and page state;
    - `apps/desktop` owns the Electron shell, bridges, and loading the Web shell.
- If online play needs extra UI command boundaries, room-service should deliver them through application-projected `availableActions` instead of forcing clients to reconstruct hidden deck counts, seat ownership, or turn ownership.
- Desktop consumes the shared app layer by loading the same Web routes / UI composition, not by duplicating a desktop-specific gameplay renderer.

### Current Baseline and Next Evolution

- `packages/ui` currently exposes a minimal validation shell by default: snapshot summary, action list, event log, and replay inspector.
- That means the Step 06 boundary is in place, but it does not yet imply that a full board UI exists.
- After the audit, Desktop should be read more narrowly:
    - the current docs confirm the boundary direction that Desktop consumes the shared app layer through the same Web routes / shared UI composition;
    - the current docs do not treat offline standalone / `file://` fallback as an accepted product-distribution capability;
    - Desktop offline packaging, asset loading, and runtime constraints are deferred into [`full-board-ui-roadmap.md`](./full-board-ui-roadmap.md) Phase 8.
- If `/play/local`, `/play/ai`, `/play/run`, and `/rooms/[roomId]` are upgraded into full board experiences, the order should remain:
    - expand contracts / application projection first;
    - then add board primitives in `packages/ui`;
    - then replace each shell's main composition.
- See [`full-board-ui-roadmap.md`](./full-board-ui-roadmap.md) for the phased delivery plan.
