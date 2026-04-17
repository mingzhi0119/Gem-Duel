# Phase 2.5 Log - UI Layout and Visual Harness Kickoff

## ZH

- 日期：2026-04-17
- Phase：Phase 2.5
- 状态：进行中
- 范围：启动 `packages/ui` 布局、design tokens 与 visual harness 的治理准备。
- 本次启动结果：
    - 已新增 [`phase-2.5-ui-layout-and-visual-harness-plan.md`](../phase-2.5-ui-layout-and-visual-harness-plan.md)，明确目录、token ownership、visual harness 与 screenshot baseline 的推荐顺序。
    - 已确认 Phase 2.5 仍是 shared UI 基建治理，不得偷渡规则、房间 authority 或 full-board renderer 完整实现。
- 当前未完成项：
    - `packages/ui` 实际目录仍未拆出 `board/hud/drawer/styles`；
    - `gd-*` 样式仍在 `apps/web/app/globals.css`；
    - playground / screenshot baseline 尚未落地。
- 下一步：
    - 先拆 `packages/ui` 目录；
    - 再迁 shared styles ownership；
    - 再接 visual harness。
- 验证：
    - 本次仅新增治理文档与 roadmap 状态，不额外修改 `packages/ui` runtime。
    - 与同一轮 Phase 2 contract wave 共用验证链：
        - `pnpm check-deps`
        - `pnpm check-boundaries`
        - `pnpm lint`
        - `pnpm typecheck`
        - `pnpm test`
        - `pnpm build`

## EN

- Date: 2026-04-17
- Phase: Phase 2.5
- Status: In Progress
- Scope: start the governance prep for `packages/ui` layout, design tokens, and the visual harness.
- Kickoff results:
    - [`phase-2.5-ui-layout-and-visual-harness-plan.md`](../phase-2.5-ui-layout-and-visual-harness-plan.md) now defines the recommended directory shape, token ownership, visual-harness plan, and screenshot-baseline order.
    - Phase 2.5 has been reconfirmed as shared-UI infrastructure governance rather than a place to smuggle in gameplay logic, room authority, or a finished full-board renderer.
- Remaining work:
    - `packages/ui` has not yet split into `board/hud/drawer/styles`;
    - `gd-*` styles still live in `apps/web/app/globals.css`;
    - the playground / screenshot baseline has not landed yet.
- Next step:
    - split the `packages/ui` directory first;
    - move shared-style ownership next;
    - then attach the visual harness.
- Validation:
    - This kickoff only lands governance docs and roadmap status; it does not yet modify `packages/ui` runtime code.
    - It is covered by the same validation wave as the Phase 2 contract landing:
        - `pnpm check-deps`
        - `pnpm check-boundaries`
        - `pnpm lint`
        - `pnpm typecheck`
        - `pnpm test`
        - `pnpm build`
