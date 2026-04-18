# Release Prep

## ZH

### 1. 文档定位

本文是 Step 08 完成后，仓库进入 engineering release/tag flow 的唯一权威流程文档。它只覆盖：

- 发布准入判断；
- 正式验收门禁；
- tag / artifact 发布步骤；
- 公开 release note 的话术约束。

> `release-ready` 仅指工程边界、构建、测试与发布门禁已收口；它不自动等同于产品 GA。产品侧的 phase closure 见 [`../10-architecture/full-board-ui-roadmap.md`](../10-architecture/full-board-ui-roadmap.md)。

### 2. 发布准入条件

所有条件必须同时成立，才允许进入后续发布步骤：

1. Step 00-08 全部为 `已完成`，见 [`../00-refactor/rebuild-execution-tracker.md`](../00-refactor/rebuild-execution-tracker.md)。
2. `full-board-ui-roadmap.md` 的 Phase 0-8 全部关闭，对应产品入口（`/play/local`、`/play/ai`、`/play/run`、`/rooms/[roomId]`、`/replays/[replayId]`、Desktop shared shell）均收敛到 shared `BoardScene` / shared shell。
3. 当前分支为主干，工作树清洁，无未提交变更或 rebase 残留。

不满足任意一条，本文件禁止驱动发布。

### 3. 最终验收门禁

按顺序串行执行，任一失败即中止发布：

```bash
pnpm contracts:generate
pnpm contracts:verify
pnpm check-deps
pnpm check-boundaries
pnpm check-contracts
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check-phase4
pnpm check-phase5
pnpm check-phase6
pnpm check-phase7
pnpm check-phase8
pnpm check-a11y
pnpm check-visual
```

验收运行必须出现在 release PR 的 evidence 字段里（commit SHA + CI run id 或本地 validation-output 摘要）。

### 4. 发布步骤

严格按编号执行，不得跳步、并行或自动化。

1. **同步主干**：拉取主干，确认本地 HEAD = 目标 release commit。
2. **运行验收门禁**：执行第 3 节所有命令，留存完整输出。
3. **审阅 artifact**：按第 5 节清单核对 `apps/desktop/dist/`、`apps/web/.next/standalone/`、`apps/web/.next/static/`、`packages/contracts/generated/` 均来自本次 build，而非旧缓存。
4. **人工创建 tag**：语义版本规则见 [`../10-architecture/engineering-standards.md`](../10-architecture/engineering-standards.md)；Step 08 不自动产生 tag。`v1.0.0+` 已不再被 roadmap Phase 4-8 gate 阻塞。
5. **上传 artifact**：只上传本次 CI 产出的已验证 artifact；第 5 节以外的任何物件禁止随 release 发布。
6. **撰写 release note**：严格遵守第 6 节的话术约束。
7. **发布后巡检**：见第 7 节。

### 5. 发布 artifact 清单

| 物件                                    | 来源                      | 用途                                                           |
| --------------------------------------- | ------------------------- | -------------------------------------------------------------- |
| `apps/desktop/dist/*`                   | `pnpm build:desktop`      | 桌面壳构建输出                                                 |
| `apps/web/.next/standalone/apps/web/**` | `pnpm build:web`          | Desktop 消费的 co-located standalone web runtime               |
| `apps/web/.next/static/**`              | `pnpm build:web`          | Desktop 在 startup 前镜像进 standalone target 的 client assets |
| `packages/contracts/generated/*`        | `pnpm contracts:generate` | schema / protocol 真相源                                       |
| `docs/`                                 | 仓库内                    | 架构、契约、运维说明，作为发布准备人工入口                     |

Desktop artifact 只有在**同时**包含 `.next/standalone/apps/web/**` 与 `.next/static/**` 并通过 `pnpm check-phase8` 时，才可称为"已验证的 offline shared-shell runtime"。

### 6. Release note 话术约束

对每个可公开产品面，只允许在其关闭的 Phase 范围内做声明，严禁外推。

| 产品表面                                 | 可声明范围                                                                                                                                           | 禁止外推                                      |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 默认 classic-local 入口（`/play/local`） | Phase 4：product-facing `BoardScene`、8 条自动化玩家路径                                                                                             | 其他模式或视觉基线之外的 platform support     |
| `/play/ai` 与 active-match `/play/run`   | Phase 5：共享主盘面 + 固定 seed / `finalStateHash` 基线                                                                                              | 额外 AI 难度 / run 内容的未验证承诺           |
| `/rooms/[roomId]`                        | Phase 6：shared `BoardScene` + spectator/out-of-turn inertness + pending-selection redaction + strong-consistency room-status cosmetics              | 未验证的 auth / matchmaking / moderation 承诺 |
| `/replays/[replayId]`                    | Phase 7：shared `BoardScene` + timeline/hash/keyboard + desktop/mobile visual baseline + bilingual catalog；Hardening Wave 1：repo-wide a11y harness | app-wide locale routing                       |
| Desktop                                  | Phase 8：shared-shell offline runtime artifact（见第 5 节 Desktop 条件）                                                                             | 签名安装器、商店分发、其他未验证 packaging    |

release note 禁止把 engineering closure 描述为"所有表面均已产品完成"。

### 7. 发布后事项

- 将实际上传的 artifact hash / tag 回写到本次 release PR 的 evidence 字段。
- 触发 [`../10-architecture/full-board-ui-roadmap.md`](../10-architecture/full-board-ui-roadmap.md) Remaining Hardening Backlog 的巡检：当前仍开放的仅有 locale routing 与 Desktop packaging。若下一轮 release 需要承诺其中任一项，必须先走其对应 plan doc，而不是在 release note 里绕过。
- 若 Phase 4-8 任意 gate 后续失效（如测试或 baseline 漂移），立即标记 release-prep 为不可用，并把该 Phase 的 log 重新 reopen；不得在本文件内偷偷软化准入条件。

### 8. 参考文档

- [`../00-refactor/rebuild-execution-tracker.md`](../00-refactor/rebuild-execution-tracker.md)：Step 00-08 总表与状态。
- [`../10-architecture/full-board-ui-roadmap.md`](../10-architecture/full-board-ui-roadmap.md)：Phase 0-8 digest 与 Remaining Hardening Backlog。
- [`../10-architecture/engineering-standards.md`](../10-architecture/engineering-standards.md)：Git、tag 与语义版本策略。
- [`./room-service-authority-semantics.md`](./room-service-authority-semantics.md)：room-service 权威语义（Phase 6 默认遵守）。
- [`../10-architecture/logs/`](../10-architecture/logs/)：Phase 0-8 关闭日志。

## EN

### 1. Document Role

This is the sole authoritative runbook for the engineering release/tag flow that reopens after Step 08. It only covers:

- release admission criteria;
- the final acceptance gate;
- the tag / artifact publication steps;
- wording constraints for public release notes.

> `release-ready` only means the rebuild boundary, build/test surface, and release gate are closed; it does not imply product GA. Product-side closure is tracked in [`../10-architecture/full-board-ui-roadmap.md`](../10-architecture/full-board-ui-roadmap.md).

### 2. Admission Criteria

All of the following must be simultaneously true before the later steps may run:

1. Step 00-08 are all marked `Completed` in [`../00-refactor/rebuild-execution-tracker.md`](../00-refactor/rebuild-execution-tracker.md).
2. Phase 0-8 in `full-board-ui-roadmap.md` are all closed, and the product entrypoints (`/play/local`, `/play/ai`, `/play/run`, `/rooms/[roomId]`, `/replays/[replayId]`, Desktop shared shell) converge on the shared `BoardScene` / shared shell.
3. The current branch is trunk, the working tree is clean, and no uncommitted or rebase-residual state remains.

If any item fails, this document must not drive a release.

### 3. Final Acceptance Gate

Run serially, in order; any failure aborts the release:

```bash
pnpm contracts:generate
pnpm contracts:verify
pnpm check-deps
pnpm check-boundaries
pnpm check-contracts
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check-phase4
pnpm check-phase5
pnpm check-phase6
pnpm check-phase7
pnpm check-phase8
pnpm check-a11y
pnpm check-visual
```

The acceptance run must be captured in the release-PR evidence field (commit SHA + CI run id, or local validation-output summary).

### 4. Release Procedure

Execute strictly in numerical order; do not skip, parallelize, or automate.

1. **Sync trunk.** Pull trunk and confirm local HEAD equals the target release commit.
2. **Run the acceptance gate.** Execute every command in Section 3 and retain full output.
3. **Review artifacts.** Cross-check Section 5: `apps/desktop/dist/`, `apps/web/.next/standalone/`, `apps/web/.next/static/`, and `packages/contracts/generated/` must all come from this build and not from stale caches.
4. **Create the tag by hand.** Semantic-version rules live in [`../10-architecture/engineering-standards.md`](../10-architecture/engineering-standards.md); Step 08 never auto-creates tags. `v1.0.0+` is no longer blocked by roadmap Phase 4-8 gates.
5. **Upload artifacts.** Upload only CI-verified outputs for this build; no item outside Section 5 may ride along with the release.
6. **Write the release note.** Strictly follow the wording constraints in Section 6.
7. **Post-release checks.** Follow Section 7.

### 5. Release Artifact Inventory

| Item                                    | Source                    | Role                                                                                  |
| --------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------- |
| `apps/desktop/dist/*`                   | `pnpm build:desktop`      | Desktop shell build output                                                            |
| `apps/web/.next/standalone/apps/web/**` | `pnpm build:web`          | Co-located standalone web runtime consumed by Desktop                                 |
| `apps/web/.next/static/**`              | `pnpm build:web`          | Client static assets mirrored into the standalone target before Desktop startup       |
| `packages/contracts/generated/*`        | `pnpm contracts:generate` | Schema / protocol source of truth                                                     |
| `docs/`                                 | repo                      | Architecture, contract, and operations guidance; human-facing release-prep entrypoint |

The Desktop artifact may only be described as a "validated offline shared-shell runtime" when it contains **both** `.next/standalone/apps/web/**` and `.next/static/**` and passes `pnpm check-phase8`.

### 6. Release-Note Wording Constraints

Each public product surface may only be described within the scope of the phase that closed it. Extrapolation is forbidden.

| Product surface                             | Allowed scope                                                                                                                                        | Must not extrapolate                                                     |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Default classic-local entry (`/play/local`) | Phase 4: product-facing `BoardScene` + 8 automated player paths                                                                                      | Other modes, or platform support beyond the committed visual baseline    |
| `/play/ai` and active-match `/play/run`     | Phase 5: shared main board + fixed-seed / `finalStateHash` baselines                                                                                 | Any unverified AI-difficulty or run-content promise                      |
| `/rooms/[roomId]`                           | Phase 6: shared `BoardScene` + spectator/out-of-turn inertness + pending-selection redaction + strong-consistency room-status cosmetics              | Unverified auth / matchmaking / moderation claims                        |
| `/replays/[replayId]`                       | Phase 7: shared `BoardScene` + timeline/hash/keyboard + desktop/mobile visual baseline + bilingual catalog; Hardening Wave 1: repo-wide a11y harness | App-wide locale routing                                                  |
| Desktop                                     | Phase 8: shared-shell offline runtime artifact (see Section 5 Desktop condition)                                                                     | Signed installers, store distribution, or any other unverified packaging |

Release notes must not describe engineering closure as “every surface is product-complete.”

### 7. Post-Release Checks

- Write back the uploaded artifact hashes / tag to the release-PR evidence field.
- Sweep the Remaining Hardening Backlog in [`../10-architecture/full-board-ui-roadmap.md`](../10-architecture/full-board-ui-roadmap.md). The still-open items are locale routing and Desktop packaging only; if the next release needs to promise either of them, that work must go through its own plan doc rather than be smuggled into a release note.
- If any Phase 4-8 gate later regresses (tests flake, baselines drift, etc.), immediately mark release-prep as unusable and reopen the corresponding phase log; do not quietly weaken the admission criteria here.

### 8. References

- [`../00-refactor/rebuild-execution-tracker.md`](../00-refactor/rebuild-execution-tracker.md): Step 00-08 tracker and state.
- [`../10-architecture/full-board-ui-roadmap.md`](../10-architecture/full-board-ui-roadmap.md): Phase 0-8 digest and Remaining Hardening Backlog.
- [`../10-architecture/engineering-standards.md`](../10-architecture/engineering-standards.md): Git, tag, and semantic-version policy.
- [`./room-service-authority-semantics.md`](./room-service-authority-semantics.md): room-service authority semantics (Phase 6 respects these by default).
- [`../10-architecture/logs/`](../10-architecture/logs/): Phase 0-8 closure logs.
