# Release Preflight Evidence - 2026-04-18

## ZH

### 范围

本文件记录一次按 [`release-prep.md`](./release-prep.md) 执行的发布前最终收尾：

- 重跑正式验收门禁；
- 审阅本次 build 产出的 release artifact；
- 记录当前是否满足“允许进入发布步骤”的准入条件。

### 结果摘要

- Step 00-08：满足。
- full-board roadmap Phase 0-8：满足。
- 当前分支为主干：**不满足**。当前分支仍是 `codex/phase8-desktop-shell`，因此本次只完成 preflight evidence，不进入 tag / upload / release-note 步骤。
- 工作树清洁：在恢复 `apps/web/next-env.d.ts` 漂移后可满足。

结论：工程门禁与 artifact 已达到可发布状态，但在切回 trunk 之前，本次 preflight 只能视为“发布前收尾完成”，不能直接驱动正式发布。

### 本轮补丁

- `apps/desktop/package.json`
    - `build` 脚本改为先清空 `dist/` 再执行 `tsc -p tsconfig.json`。
    - 目的：消除旧的 `preload.js` / `preload.d.ts` 残留，确保 `apps/desktop/dist/*` 全部来自本次 build，而非旧缓存。

### 正式验收门禁

以下命令按 `release-prep.md` 第 3 节串行执行，全部通过：

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

### Artifact 审阅

以下目录已按第 5 节清单审阅：

- `apps/desktop/dist/*`
    - 构建时间：`2026-04-18 13:33:32`
    - 审阅结论：已无旧的 `preload.js` / `preload.d.ts` 残留；当前仅保留本次构建需要的 `main.*`、`preload.cjs*`、`web-runtime*` 产物。
- `apps/web/.next/standalone/apps/web/**`
    - 审阅结论：存在 `server.js`、standalone `.next/`、`BUILD_ID`、manifest 与 server chunks，符合 Desktop shared-shell runtime 预期。
- `apps/web/.next/static/**`
    - 审阅结论：client static assets 已生成，供 Desktop startup 前镜像进入 standalone target。
- `packages/contracts/generated/*`
    - 审阅结论：`openapi.json` 与 `asyncapi.yaml` 已由本轮 `contracts:generate` 刷新。

### Artifact Hash 摘要

| Artifact                                              | SHA256                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------ |
| `apps/desktop/dist/main.js`                           | `49AFFE3BC01BA3103D489091EE81B47DD5C77984163253B9A4B3ED1C8A468E74` |
| `apps/desktop/dist/preload.cjs`                       | `E195A5DA5188CB6DE2C3C3CDDF66B87FEB59D0A92FF54DBE1D5CD22B398A3793` |
| `apps/desktop/dist/web-runtime.js`                    | `93D59811F905F643D80D8112541D7753B23515D1DB685BC261BAA5E44A177DBD` |
| `apps/web/.next/standalone/apps/web/server.js`        | `33E34FE28761913184FD8EDC870016145CD828058F457D7091292CD807F7D61C` |
| `packages/contracts/generated/openapi/openapi.json`   | `D24A076D76582BA0C19C59627ADD3DBC31889CA662A0A33D183C2AFEEC2B04AD` |
| `packages/contracts/generated/asyncapi/asyncapi.yaml` | `4BB3629CDD7B94BC9F9F63D13CD3D182CFA76A8B5417584F9B0F948D2A2C45E0` |

### 剩余阻塞

在真正进入 `release-prep.md` 第 4 节发布步骤前，还剩最后一项：

1. 切回 trunk，并确认 trunk HEAD = 目标 release commit。

若这一点完成，本次 preflight 已不再存在额外工程 blocker。

## EN

### Scope

This file records one pre-release closeout run executed against [`release-prep.md`](./release-prep.md):

- rerun the final acceptance gate;
- review the artifacts produced by the current build;
- record whether the repo is allowed to enter the actual release steps.

### Summary

- Step 00-08: satisfied.
- Full-board roadmap Phase 0-8: satisfied.
- Current branch is trunk: **not satisfied**. The current branch is still `codex/phase8-desktop-shell`, so this run stops at preflight evidence and does not enter tag / upload / release-note steps.
- Working tree clean: satisfiable once the generated `apps/web/next-env.d.ts` drift is restored.

Conclusion: the engineering gates and artifact inventory are in a releasable state, but until the work is on trunk this run must remain a preflight closeout rather than a live release.

### Patch Landed in This Preflight

- `apps/desktop/package.json`
    - The `build` script now deletes `dist/` before running `tsc -p tsconfig.json`.
    - Purpose: remove stale `preload.js` / `preload.d.ts` leftovers so `apps/desktop/dist/*` contains only outputs from the current build.

### Final Acceptance Gate

The following commands were run serially, exactly as listed in Section 3 of `release-prep.md`, and all passed:

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

### Artifact Review

The following directories were reviewed against Section 5:

- `apps/desktop/dist/*`
    - Build time: `2026-04-18 13:33:32`
    - Review result: stale `preload.js` / `preload.d.ts` leftovers are gone; the directory now contains only the expected `main.*`, `preload.cjs*`, and `web-runtime*` outputs from the current build.
- `apps/web/.next/standalone/apps/web/**`
    - Review result: `server.js`, the standalone `.next/`, `BUILD_ID`, manifests, and server chunks are present as expected for the Desktop shared-shell runtime.
- `apps/web/.next/static/**`
    - Review result: client static assets are present for mirroring into the standalone target before Desktop startup.
- `packages/contracts/generated/*`
    - Review result: `openapi.json` and `asyncapi.yaml` were refreshed by the current `contracts:generate` run.

### Artifact Hash Digest

| Artifact                                              | SHA256                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------ |
| `apps/desktop/dist/main.js`                           | `49AFFE3BC01BA3103D489091EE81B47DD5C77984163253B9A4B3ED1C8A468E74` |
| `apps/desktop/dist/preload.cjs`                       | `E195A5DA5188CB6DE2C3C3CDDF66B87FEB59D0A92FF54DBE1D5CD22B398A3793` |
| `apps/desktop/dist/web-runtime.js`                    | `93D59811F905F643D80D8112541D7753B23515D1DB685BC261BAA5E44A177DBD` |
| `apps/web/.next/standalone/apps/web/server.js`        | `33E34FE28761913184FD8EDC870016145CD828058F457D7091292CD807F7D61C` |
| `packages/contracts/generated/openapi/openapi.json`   | `D24A076D76582BA0C19C59627ADD3DBC31889CA662A0A33D183C2AFEEC2B04AD` |
| `packages/contracts/generated/asyncapi/asyncapi.yaml` | `4BB3629CDD7B94BC9F9F63D13CD3D182CFA76A8B5417584F9B0F948D2A2C45E0` |

### Remaining Blocker

Before Section 4 of `release-prep.md` may run for real, one blocker remains:

1. Move the work onto trunk and confirm trunk HEAD equals the target release commit.

Once that is done, this preflight leaves no additional engineering blocker.
