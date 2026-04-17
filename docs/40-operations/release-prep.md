# Release Prep

## ZH

Step 08 完成后，仓库进入 release-ready 状态：核心契约、域模型、core-engine、application、web、desktop 与 room-service 的重构边界都已经收口，发布流程只负责做最终验收、构建桌面产物并上传已验证的 artifact。

这里的 “release-ready” 指的是重构边界、构建、测试与发布门禁已经收口；它不自动等同于“完整产品盘面 UI 已达到历史成品水位”。完整盘面 UI 的后续路线图见 `docs/10-architecture/full-board-ui-roadmap.md`。

### 审计后发布边界

- Step 08 放行的是 engineering release/tag flow，不是产品 GA 结论。
- `v1.0.0` 及以上产品语义版本仍受 `docs/10-architecture/full-board-ui-roadmap.md` 的 Phase 4 约束。
- Desktop artifact 当前只应视作 shared-shell engineering artifact；Desktop offline 可分发能力仍受该路线图的 Phase 8 约束。
- 若未来需要公开产品发布说明，必须同时满足：
    - full-board roadmap Phase 4 已完成；
    - 默认玩家入口不再是按钮列表验证壳；
    - release note 不再把 engineering closure 表述为产品完成。

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
- 在 Phase 4 完成前，不得把 Step 08 的通过转述为“产品 v1 已可发布”。
- 在 Phase 8 完成前，不得把 Desktop artifact 转述为“已验证的 offline 分发包”。

## EN

After Step 08, the repository is in a release-ready state: the rebuild boundaries for contracts, domain, core-engine, application, web, desktop, and room-service are all settled, and the release flow only performs final acceptance, desktop artifact build, and upload of already-verified outputs.

Here, `release-ready` means the rebuild boundary, build/test surface, and release gate are closed; it does not automatically mean that the product already has a legacy-grade full board UI. The follow-up board-UI roadmap lives in `docs/10-architecture/full-board-ui-roadmap.md`.

### Post-Audit Release Scope

- Step 08 reopens the engineering release/tag flow; it is not a product-GA conclusion.
- Product-semantic versions `v1.0.0+` remain gated on Phase 4 of `docs/10-architecture/full-board-ui-roadmap.md`.
- The current Desktop artifact should be treated only as a shared-shell engineering artifact; Desktop offline distributability remains gated on Phase 8 of that roadmap.
- Any future public product-release note must also satisfy:
    - full-board roadmap Phase 4 is complete;
    - the default player entrypoint is no longer the button-list validation shell;
    - release notes no longer describe engineering closure as product completion.

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
- Before Phase 4, Step 08 passing may not be restated as "product v1 is ready to ship."
- Before Phase 8, the Desktop artifact may not be restated as a validated offline distribution package.
