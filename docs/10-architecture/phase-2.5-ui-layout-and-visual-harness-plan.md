# Phase 2.5 UI Layout and Visual Harness Plan

## ZH

### 文档定位

本文是 `docs/10-architecture/full-board-ui-roadmap.md` Phase 2.5 的治理主文档，用来约束 `packages/ui` 的目录、design tokens、shared styles ownership 与 visual harness 落地顺序。

### 当前问题

- `packages/ui/src/index.tsx` 仍是单文件壳组件集合。
- `apps/web/app/globals.css` 仍持有 `gd-*` shared shell 样式。
- 当前仓库没有静态 full-board fixture 渲染入口，也没有 screenshot baseline。

### Phase 2.5 目标

- 把 `packages/ui` 建成真正承载 shared primitives 的宿主，而不是临时壳组件包。
- 把 shared CSS / tokens 从 `apps/web` 页面范围收回到 `packages/ui`。
- 建立最小 visual harness，为后续 Phase 3/4 的 board renderer 提供静态 scene 与截图基线。

### 推荐目录

```text
packages/ui/src/
  index.tsx
  primitives/
  board/
  hud/
  drawer/
  styles/
```

### 推荐输出顺序

1. 先建立 `styles/` 与 token layer。
2. 再迁移当前 `gd-*` shared shell 样式 ownership。
3. 再建立静态 playground / fixture scene。
4. 最后引入 screenshot baseline 与 `check-visual` 草案。

### 本阶段收口决策

- visual harness 采用 `apps/web/app/playground/*` 作为静态场景入口，而不是先接入 Storybook/Ladle。
- playground 至少要覆盖：
    - classic player turn / pending selection
    - spectator / waiting or resync style state
    - run-sidecar or prompt-heavy state
    - terminal / completed state
- `check-visual` 采用 Playwright screenshot baseline，先对 playground 场景做截图，不等待 Phase 3 完整盘面 renderer。
- `check-visual` 由仓库级脚本负责启动 `apps/web`、等待 `/playground` 可访问、再执行 screenshot compare；这样 shell/workspace 不需要各自重复接线。
- Playwright 的临时运行输出固定写入已 ignore 的 `tmp/playwright/test-results`；受版本控制的真相面只包含 spec 文件与 committed baselines。
- Phase 2.5 完成时，roadmap 与 phase log 必须明确：
    - visual baseline 已开始建立；
    - `packages/ui` 已能在静态 fixture 下承载 Phase 3 primitives；
    - Phase 3 仍需补 full-board primitives 本身，不能把 visual harness completion 误读为 full-board renderer completion。

### 非目标

- 不在本阶段完成 full-board renderer。
- 不在本阶段切 `/play/local` 默认主画面。
- 不在本阶段引入规则逻辑到 `packages/ui`。

## EN

### Document Role

This document is the governance anchor for Phase 2.5 in `docs/10-architecture/full-board-ui-roadmap.md`. It defines the landing order for `packages/ui` layout, design tokens, shared-style ownership, and the visual harness.

### Current Problems

- `packages/ui/src/index.tsx` is still a single-file shell component surface.
- `apps/web/app/globals.css` still owns the `gd-*` shared-shell styling.
- The repo still lacks a static full-board fixture-rendering entrypoint and any screenshot baseline.

### Phase 2.5 Goals

- Turn `packages/ui` into the real host for shared primitives rather than a temporary shell-component package.
- Move shared CSS / tokens out of `apps/web` page scope and back into `packages/ui`.
- Establish the minimum visual harness required by Phase 3/4 board-renderer work.

### Recommended Layout

```text
packages/ui/src/
  index.tsx
  primitives/
  board/
  hud/
  drawer/
  styles/
```

### Recommended Landing Order

1. Establish `styles/` and the token layer first.
2. Move current `gd-*` shared-shell styling ownership next.
3. Add the static playground / fixture-scene surface next.
4. Add the screenshot baseline and `check-visual` draft last.

### Closure Decisions For This Phase

- The visual harness uses `apps/web/app/playground/*` as the static-scene surface rather than introducing Storybook/Ladle first.
- The playground must cover at least:
    - a classic player-turn / pending-selection scene
    - a spectator / waiting or resync-flavored scene
    - a run-sidecar or prompt-heavy scene
    - a terminal / completed scene
- `check-visual` uses a Playwright screenshot baseline against those playground scenes without waiting for the finished Phase 3 board renderer.
- The repo-level `check-visual` script owns starting `apps/web`, waiting for `/playground`, and running screenshot comparison so shells do not need duplicate wiring.
- Playwright's temporary run output is fixed to the ignored `tmp/playwright/test-results` path; the versioned truth surface contains only the specs and committed baselines.
- When Phase 2.5 closes, the roadmap and phase log must explicitly say:
    - the visual baseline has started;
    - `packages/ui` is now a viable host for Phase 3 primitives under static fixtures;
    - Phase 3 still owns the full-board primitives themselves and is not implicitly complete.

### Non-Goals

- Do not complete the full-board renderer here.
- Do not switch `/play/local` to the new default board here.
- Do not introduce gameplay logic into `packages/ui` here.
