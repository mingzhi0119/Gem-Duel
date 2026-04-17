# Step 00 Log - Legacy Archive

## ZH

- 日期：2026-04-16
- 作者：Codex
- Step ID：Step 00
- 本步目标：将旧 Vite/Electron 项目从活动根目录归档到 `old/legacy-vite-electron/`，并补齐最小必要路径修正。
- 实际改动内容：
    - 将 legacy `src/`、`electron/`、`public/`、`index.html`、`vite.config.ts`、`tailwind.config.ts`、`scripts/patch-peer.js`、`build/GameIcon.png`、`.vite/` 统一移入 `old/legacy-vite-electron/`
    - 更新 legacy 路径说明与归档文案
    - 扩展 `eslint.config.mjs` 的 legacy import 护栏到 `old/**`
    - 更新 `package.json` 中的 legacy 提示脚本
- 涉及路径：
    - `old/legacy-vite-electron/`
    - `README.md`
    - `TESTING.md`
    - `RELEASE_NOTES.md`
    - `docs/99-legacy/README.md`
    - `docs/00-refactor/full-rebuild-plan.md`
    - `package.json`
    - `eslint.config.mjs`
- 关键决策：
    - 采用完整归档，而不是只移动源码目录
    - legacy 目录保留原有相对结构，便于人工对照与逐步迁移
- 风险/阻塞：
    - 旧实现仍需长期保留到 `Step 08`
    - 当前工作区还存在不属于本步提交范围的其他未提交改动，需要后续按步骤继续收口
- 下一步：建立步骤总表、日志规范、工程规范与强化后的 `AGENTS.md`
- 对应 Commit：`7c10838 chore(legacy): archive legacy vite-electron project into old`

## EN

- Date: 2026-04-16
- Author: Codex
- Step ID: Step 00
- Goal: archive the legacy Vite/Electron project under `old/legacy-vite-electron/` and complete the minimum required path corrections.
- Actual changes:
    - Moved legacy `src/`, `electron/`, `public/`, `index.html`, `vite.config.ts`, `tailwind.config.ts`, `scripts/patch-peer.js`, `build/GameIcon.png`, and `.vite/` into `old/legacy-vite-electron/`
    - Updated legacy path descriptions and archive wording
    - Extended the legacy import guard in `eslint.config.mjs` to cover `old/**`
    - Updated the legacy helper note in `package.json`
- Touched paths:
    - `old/legacy-vite-electron/`
    - `README.md`
    - `TESTING.md`
    - `RELEASE_NOTES.md`
    - `docs/99-legacy/README.md`
    - `docs/00-refactor/full-rebuild-plan.md`
    - `package.json`
    - `eslint.config.mjs`
- Key decisions:
    - Chose full archive scope instead of source-only moves
    - Preserved original relative structure inside the legacy archive for human comparison and phased migration
- Risks / blockers:
    - The legacy archive must remain in place until `Step 08`
    - The working tree still contains other pre-existing uncommitted changes outside this step boundary
- Next step: add the execution tracker, log conventions, engineering standards, and stronger `AGENTS.md` rules
- Commit reference: `7c10838 chore(legacy): archive legacy vite-electron project into old`
