# Release Prep

## ZH

Step 08 完成后，仓库进入 release-ready 状态：核心契约、域模型、core-engine、application、web、desktop 与 room-service 的重构边界都已经收口，发布流程只负责做最终验收、构建桌面产物并上传已验证的 artifact。

这里的 “release-ready” 指的是重构边界、构建、测试与发布门禁已经收口；它不自动等同于“完整产品盘面 UI 已达到历史成品水位”。完整盘面 UI 的后续路线图见 `docs/10-architecture/full-board-ui-roadmap.md`。

### 审计后发布边界

- Step 08 放行的是 engineering release/tag flow，不是产品 GA 结论。
- `docs/10-architecture/full-board-ui-roadmap.md` 的 Phase 4 local-player gate 已关闭；默认 classic-local 玩家入口现已具备 product-facing `BoardScene` 与 8 条自动化玩家路径。
- `v1.0.0` 及以上产品语义版本不再受 local-player board completeness 单点阻塞，但后续产品口径仍必须明确剩余未闭合的 phase。
- Desktop artifact 当前只应视作 shared-shell engineering artifact；Desktop offline 可分发能力仍受该路线图的 Phase 8 约束。
- 若未来需要公开产品发布说明，必须同时满足：
    - 默认 classic-local 玩家入口的声明只覆盖已关闭的 Phase 4 范围；
    - `/play/ai`、`/play/run` parity 若未完成，不得被表述为同等产品完成面；
    - `/rooms/[roomId]`、spectator / resync 一致性若未完成，不得被表述为 online 产品完成面；
    - Desktop offline 若未完成，不得被表述为已验证分发面；
    - release note 不再把 engineering closure 表述为“所有表面都已产品完成”。

### 当前产物

- `apps/desktop/dist/*`: 桌面壳构建输出，作为当前 release 上传目标
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

### Step 08 约束

- Step 08 只会放行未来的 tag-based release flow。
- Step 08 不会自动创建 tag。
- 进入 release 前，CI 必须先通过完整最终验收门禁，再执行 artifact upload。
- Phase 4 已关闭后，默认 classic-local 玩家入口可以被表述为已完成的产品默认面，但不得顺势外推为 AI / run / online / Desktop parity。
- 在 Phase 8 完成前，不得把 Desktop artifact 转述为“已验证的 offline 分发包”。

## EN

After Step 08, the repository is in a release-ready state: the rebuild boundaries for contracts, domain, core-engine, application, web, desktop, and room-service are all settled, and the release flow only performs final acceptance, desktop artifact build, and upload of already-verified outputs.

Here, `release-ready` means the rebuild boundary, build/test surface, and release gate are closed; it does not automatically mean that the product already has a legacy-grade full board UI. The follow-up board-UI roadmap lives in `docs/10-architecture/full-board-ui-roadmap.md`.

### Post-Audit Release Scope

- Step 08 reopens the engineering release/tag flow; it is not a product-GA conclusion.
- The Phase 4 local-player gate in `docs/10-architecture/full-board-ui-roadmap.md` is now closed; the default classic-local player entrypoint now has a product-facing `BoardScene` plus 8 automated player paths.
- Product-semantic versions `v1.0.0+` are no longer blocked by the local-player board-completeness gate alone, but release wording must still respect the phases that remain open.
- The current Desktop artifact should be treated only as a shared-shell engineering artifact; Desktop offline distributability remains gated on Phase 8 of that roadmap.
- Any future public product-release note must also satisfy:
    - any default-entry claim is scoped to the now-closed Phase 4 classic-local surface;
    - `/play/ai` and `/play/run` are not described as parity-complete if Phase 5 is still open;
    - `/rooms/[roomId]`, spectator, and resync are not described as online-product complete if Phase 6 is still open;
    - Desktop offline is not described as validated distributability if Phase 8 is still open;
    - release notes no longer describe engineering closure as “all surfaces are product-complete.”

### Current Artifacts

- `apps/desktop/dist/*`: desktop shell build output, currently the release upload target
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

### Step 08 Constraint

- Step 08 only unlocks the future tag-based release flow.
- Step 08 does not create tags automatically.
- Before upload, CI must pass the full final acceptance gate and only then publish artifacts.
- With Phase 4 closed, the default classic-local player entrypoint may now be described as a completed product-default surface, but that may not be stretched into AI / run / online / Desktop parity.
- Before Phase 8, the Desktop artifact may not be restated as a validated offline distribution package.
