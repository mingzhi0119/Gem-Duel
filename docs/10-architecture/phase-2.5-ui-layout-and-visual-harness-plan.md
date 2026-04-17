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

### Non-Goals

- Do not complete the full-board renderer here.
- Do not switch `/play/local` to the new default board here.
- Do not introduce gameplay logic into `packages/ui` here.
