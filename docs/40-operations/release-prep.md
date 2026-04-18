# Release Prep

## ZH

Step 08 完成后，仓库进入 release-ready 状态：核心契约、域模型、core-engine、application、web、desktop 与 room-service 的重构边界都已经收口，发布流程只负责做最终验收并上传已验证的 artifact。

这里的 “release-ready” 指的是重构边界、构建、测试与发布门禁已经收口；它不自动等同于“完整产品盘面 UI 已达到历史成品水位”。完整盘面 UI 的后续路线图见 `docs/10-architecture/full-board-ui-roadmap.md`。

### 审计后发布边界

- Step 08 放行的是 engineering release/tag flow，不是产品 GA 结论。
- `docs/10-architecture/full-board-ui-roadmap.md` 的 Phase 4 local-player gate 已关闭；默认 classic-local 玩家入口现已具备 product-facing `BoardScene` 与 8 条自动化玩家路径。
- `docs/10-architecture/full-board-ui-roadmap.md` 的 Phase 5 AI/run parity gate 现也已关闭；`/play/ai` 与 active-match `/play/run` 已共享同一 product-facing 主盘面，并具备固定 seed / `finalStateHash` 基线。
- `docs/10-architecture/full-board-ui-roadmap.md` 的 Phase 6 online-board convergence gate 现已关闭；`/rooms/[roomId]` 已接入 shared `BoardScene`，spectator/out-of-turn 行为具备 browser/integration gate，spectator pending-selection redaction 已成为正式门禁。
- `docs/10-architecture/full-board-ui-roadmap.md` 的 Phase 7 replay/product-finish gate 现也已关闭；`/replays/[replayId]` 已复用 shared `BoardScene`，timeline/hash/keyboard/i18n 与 replay desktop/mobile visual baselines 已具备正式门禁。
- `docs/10-architecture/full-board-ui-roadmap.md` 的 Phase 8 desktop-offline gate 现也已关闭；Desktop shared shell 现在会自动拉起 co-located standalone web runtime、同步静态资源，并通过 `pnpm check-phase8` 验证启动、bridge、资源加载与主盘面 smoke path。
- `v1.0.0` 及以上产品语义版本已不再受 roadmap Phase 4-8 gate 阻塞，但公共发布口径仍必须精确描述当前已验证 artifact 的形态。
- 若未来需要公开产品发布说明，必须同时满足：
    - 默认 classic-local 玩家入口的声明只覆盖已关闭的 Phase 4 范围；
    - `/play/ai` 与 active-match `/play/run` 的产品表述只覆盖已关闭的 Phase 5 范围；
    - `/rooms/[roomId]` 的产品表述只覆盖已关闭的 Phase 6 共享主盘面与 spectator/inertness 范围；
    - `/replays/[replayId]` 的产品表述只覆盖已关闭的 Phase 7 replay/shared-board/a11y/keyboard/mobile/i18n 表面；
    - Desktop 的产品表述只覆盖已关闭的 Phase 8 shared-shell offline runtime artifact，不得顺势外推为签名安装器、商店分发或其他未验证 packaging 形态；
    - release note 不再把 engineering closure 表述为“所有表面都已产品完成”。

### 当前产物

- `apps/desktop/dist/*`: 桌面壳构建输出
- `apps/web/.next/standalone/apps/web/**`: Desktop 消费的 co-located standalone web runtime
- `apps/web/.next/static/**`: Desktop 在 startup 前会镜像进 standalone target 的 client static assets
- `packages/contracts/generated/*`: 契约生成产物，作为发布前的 schema / protocol 真相
- `docs/`: 架构、契约、运行与迁移说明，作为发布准备的人工入口

### 最终验收门禁

- `pnpm contracts:generate`
- `pnpm contracts:verify`
- `pnpm check-deps`
- `pnpm check-boundaries`
- `pnpm check-contracts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm check-phase4`
- `pnpm check-phase5`
- `pnpm check-phase6`
- `pnpm check-phase7`
- `pnpm check-phase8`
- `pnpm check-visual`

### Step 08 约束

- Step 08 只会放行未来的 tag-based release flow。
- Step 08 不会自动创建 tag。
- 进入 release 前，CI 必须先通过完整最终验收门禁，再执行 artifact upload。
- 现已关闭的 Phase 4-8 允许把 local、AI、active-match run、online room、replay 与 Desktop shared shell 描述为已验证的 shared-board/shared-shell 产品面。
- Desktop artifact 只有在包含当前已验证的 co-located standalone web payload 与 static assets 时，才可被表述为已验证的 offline shared-shell runtime；这不自动等同于 installer/signing/store packaging 全部完成。

## EN

After Step 08, the repository is in a release-ready state: the rebuild boundaries for contracts, domain, core-engine, application, web, desktop, and room-service are all settled, and the release flow only performs final acceptance and upload of already-verified outputs.

Here, `release-ready` means the rebuild boundary, build/test surface, and release gate are closed; it does not automatically mean that the product already has a legacy-grade full board UI. The follow-up board-UI roadmap lives in `docs/10-architecture/full-board-ui-roadmap.md`.

### Post-Audit Release Scope

- Step 08 reopens the engineering release/tag flow; it is not a product-GA conclusion.
- The Phase 4 local-player gate in `docs/10-architecture/full-board-ui-roadmap.md` is now closed; the default classic-local player entrypoint now has a product-facing `BoardScene` plus 8 automated player paths.
- The Phase 5 AI/run parity gate in `docs/10-architecture/full-board-ui-roadmap.md` is now also closed; `/play/ai` and active-match `/play/run` now share the same product-facing main board and fixed-seed / `finalStateHash` baselines.
- The Phase 6 online-board convergence gate in `docs/10-architecture/full-board-ui-roadmap.md` is now also closed; `/rooms/[roomId]` now uses the shared `BoardScene`, spectator/out-of-turn behavior is browser/integration-gated, and spectator pending-selection redaction is now a formal invariant.
- The Phase 7 replay/product-finish gate in `docs/10-architecture/full-board-ui-roadmap.md` is now also closed; `/replays/[replayId]` now reuses the shared `BoardScene`, and timeline/hash/keyboard/i18n plus replay desktop/mobile visual baselines are now formally gated.
- The Phase 8 desktop-offline gate in `docs/10-architecture/full-board-ui-roadmap.md` is now also closed; the Desktop shell now auto-starts the co-located standalone web runtime, syncs static assets, and is validated by `pnpm check-phase8` for startup, bridge, resource loading, and main-board smoke coverage.
- Product-semantic versions `v1.0.0+` are no longer blocked by roadmap Phase 4-8 gates, but public release wording must still describe the currently validated artifact shape precisely.
- Any future public product-release note must also satisfy:
    - any default-entry claim is scoped to the now-closed Phase 4 classic-local surface;
    - `/play/ai` and active-match `/play/run` claims are scoped only to the now-closed Phase 5 surface;
    - `/rooms/[roomId]` claims are scoped only to the now-closed Phase 6 shared-board and spectator/inertness surface;
    - `/replays/[replayId]` claims are scoped only to the now-closed Phase 7 replay/shared-board/a11y/keyboard/mobile/i18n surface;
    - Desktop claims are scoped only to the now-closed Phase 8 shared-shell offline runtime artifact and must not be stretched into signed installers, store distribution, or other unverified packaging forms;
    - release notes no longer describe engineering closure as “all surfaces are product-complete.”

### Current Artifacts

- `apps/desktop/dist/*`: desktop shell build output
- `apps/web/.next/standalone/apps/web/**`: co-located standalone web runtime consumed by Desktop
- `apps/web/.next/static/**`: client static assets mirrored into the standalone target before Desktop startup
- `packages/contracts/generated/*`: generated contract artifacts and the source of truth for schema/protocol validation
- `docs/`: architecture, contract, operations, and migration guidance for release preparation

### Final Acceptance Gates

- `pnpm contracts:generate`
- `pnpm contracts:verify`
- `pnpm check-deps`
- `pnpm check-boundaries`
- `pnpm check-contracts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm check-phase4`
- `pnpm check-phase5`
- `pnpm check-phase6`
- `pnpm check-phase7`
- `pnpm check-phase8`
- `pnpm check-visual`

### Step 08 Constraint

- Step 08 only unlocks the future tag-based release flow.
- Step 08 does not create tags automatically.
- Before upload, CI must pass the full final acceptance gate and only then publish artifacts.
- With Phase 4-8 closed, the local, AI, active-match run, online room, replay, and Desktop shared-shell entrypoints may now be described as validated shared-board/shared-shell product surfaces.
- The Desktop artifact may only be described as a validated offline shared-shell runtime when it includes the co-located standalone web payload and static assets covered by `pnpm check-phase8`; that does not automatically imply installer/signing/store packaging parity.
