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

## EN

- Starting in Step 06, Web and Desktop should no longer maintain separate copies of local-action logic, online-action logic, or spectator filtering logic.
- The shared rule is:
    - `packages/application` composes authoritative or visible snapshots into the shared `UiViewModel`;
    - `packages/ui` renders the `UiViewModel` and interaction callbacks only;
    - `apps/web` owns routing, BFF work, browser transport, and page state;
    - `apps/desktop` owns the Electron shell, bridges, and loading the Web shell.
- If online play needs extra UI command boundaries, room-service should deliver them through application-projected `availableActions` instead of forcing clients to reconstruct hidden deck counts, seat ownership, or turn ownership.
- Desktop consumes the shared app layer by loading the same Web routes / UI composition, not by duplicating a desktop-specific gameplay renderer.
