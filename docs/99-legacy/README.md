# Legacy Archive

## ZH

这里记录旧版单包 `Vite + Electron` 实现的归档入口。旧代码统一保存在 `old/legacy-vite-electron/` 下，只作为人工参考，不再是新架构真相。

### 归档条目

- `old/legacy-vite-electron/src/`: 旧版 React/Vite 单包实现
- `old/legacy-vite-electron/electron/`: 旧版 Electron 入口
- `old/legacy-vite-electron/public/`: 旧版静态资源
- `old/legacy-vite-electron/scripts/`: 旧版构建辅助脚本
- `old/legacy-vite-electron/build/`: 旧版发行资源
- `old/legacy-vite-electron/.vite/`: 旧版被跟踪的缓存产物归档
- 根级 `README.md`、`TESTING.md`、`RELEASE_NOTES.md`: 已改写为索引文档，详细旧语义以 git 历史和旧目录为准

### Step 04 抽取笔记

- [`extracted-gem-selection.md`](./extracted-gem-selection.md): gem selection、直线合法性与 privilege side effect
- [`extracted-board-refill-and-discard.md`](./extracted-board-refill-and-discard.md): board refill、spiral refill 与 discard cleanup
- [`extracted-market-buy-reserve.md`](./extracted-market-buy-reserve.md): reserve / buy source、market refill 与 chained ability
- [`extracted-royal-milestones.md`](./extracted-royal-milestones.md): crown milestone、royal selection 与 turn restoration
- [`extracted-privilege-scrolls.md`](./extracted-privilege-scrolls.md): privilege usage、shared cap 与 transfer semantics
- [`extracted-scoring-and-win-conditions.md`](./extracted-scoring-and-win-conditions.md): points / crowns / single-color victory checks

## EN

This directory indexes the legacy single-package `Vite + Electron` implementation. The old code now lives under `old/legacy-vite-electron/` and is preserved strictly as read-only reference material rather than active architecture truth.

### Archive Entries

- `old/legacy-vite-electron/src/`: legacy React/Vite implementation
- `old/legacy-vite-electron/electron/`: legacy Electron entrypoint
- `old/legacy-vite-electron/public/`: legacy static assets
- `old/legacy-vite-electron/scripts/`: legacy helper scripts
- `old/legacy-vite-electron/build/`: legacy release assets
- `old/legacy-vite-electron/.vite/`: archived tracked cache artifacts
- root `README.md`, `TESTING.md`, and `RELEASE_NOTES.md`: rewritten as index documents; detailed legacy semantics live in git history and the archived directories

### Step 04 Extraction Notes

- [`extracted-gem-selection.md`](./extracted-gem-selection.md): gem selection, line legality, and privilege side effects
- [`extracted-board-refill-and-discard.md`](./extracted-board-refill-and-discard.md): board refill, spiral refill order, and discard cleanup
- [`extracted-market-buy-reserve.md`](./extracted-market-buy-reserve.md): reserve / buy sources, market refill, and chained abilities
- [`extracted-royal-milestones.md`](./extracted-royal-milestones.md): crown milestones, royal selection, and turn restoration
- [`extracted-privilege-scrolls.md`](./extracted-privilege-scrolls.md): privilege usage, shared-cap handling, and transfer semantics
- [`extracted-scoring-and-win-conditions.md`](./extracted-scoring-and-win-conditions.md): points / crowns / single-color victory checks
