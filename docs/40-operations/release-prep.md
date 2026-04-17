# Release Prep

## ZH

Step 08 完成后，仓库进入 release-ready 状态：核心契约、域模型、core-engine、application、web、desktop 与 room-service 的重构边界都已经收口，发布流程只负责做最终验收、构建桌面产物并上传已验证的 artifact。

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

## EN

After Step 08, the repository is in a release-ready state: the rebuild boundaries for contracts, domain, core-engine, application, web, desktop, and room-service are all settled, and the release flow only performs final acceptance, desktop artifact build, and upload of already-verified outputs.

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
