# Legacy Extracts

## ZH

这里记录旧版单包 `Vite + Electron` 实现提炼出的 legacy 规则笔记。Step 08 已删除 live legacy source tree，当前首选入口是本目录下的 extraction notes，其次是 git 历史。

### 归档条目

- `docs/99-legacy/extracted-*.md`: 已提炼的 legacy 规则笔记
- git 历史：当当前笔记还不够时，回看重构前的提交与变更片段
- 根级 `README.md`、`TESTING.md`、`RELEASE_NOTES.md`: 已改写为索引文档，正式的 legacy 语义应优先落在本目录与 git 历史中

### Step 04 抽取笔记

- [`extracted-gem-selection.md`](./extracted-gem-selection.md): gem selection、直线合法性与 privilege side effect
- [`extracted-board-refill-and-discard.md`](./extracted-board-refill-and-discard.md): board refill、spiral refill 与 discard cleanup
- [`extracted-market-buy-reserve.md`](./extracted-market-buy-reserve.md): reserve / buy source、market refill 与 chained ability
- [`extracted-royal-milestones.md`](./extracted-royal-milestones.md): crown milestone、royal selection 与 turn restoration
- [`extracted-privilege-scrolls.md`](./extracted-privilege-scrolls.md): privilege usage、shared cap 与 transfer semantics
- [`extracted-scoring-and-win-conditions.md`](./extracted-scoring-and-win-conditions.md): points / crowns / single-color victory checks

### Step 07 抽取笔记

- [`extracted-ai-heuristics.md`](./extracted-ai-heuristics.md): AI sub-phase priority、candidate ranking 与 deterministic tie-breaking intent
- [`extracted-buff-draft-and-run-loop.md`](./extracted-buff-draft-and-run-loop.md): pre-match buff draft、init effects 与 run-loop clean-room normalization
- [`extracted-buff-catalog-step07.md`](./extracted-buff-catalog-step07.md): Step 07 starter Buff subset 与 why-it-fits-frozen-atoms notes

## EN

This directory indexes the legacy rule notes distilled from the old single-package `Vite + Electron` implementation. Step 08 removed the live legacy source tree, so the primary entrypoint is now the extraction notes in this directory, followed by git history.

### Archive Entries

- `docs/99-legacy/extracted-*.md`: extracted legacy rule notes
- git history: use when the current note needs broader historical context from the pre-rebuild source tree
- root `README.md`, `TESTING.md`, and `RELEASE_NOTES.md`: rewritten as index documents; the durable legacy semantics now live in this directory and in git history

### Step 04 Extraction Notes

- [`extracted-gem-selection.md`](./extracted-gem-selection.md): gem selection, line legality, and privilege side effects
- [`extracted-board-refill-and-discard.md`](./extracted-board-refill-and-discard.md): board refill, spiral refill order, and discard cleanup
- [`extracted-market-buy-reserve.md`](./extracted-market-buy-reserve.md): reserve / buy sources, market refill, and chained abilities
- [`extracted-royal-milestones.md`](./extracted-royal-milestones.md): crown milestones, royal selection, and turn restoration
- [`extracted-privilege-scrolls.md`](./extracted-privilege-scrolls.md): privilege usage, shared-cap handling, and transfer semantics
- [`extracted-scoring-and-win-conditions.md`](./extracted-scoring-and-win-conditions.md): points / crowns / single-color victory checks

### Step 07 Extraction Notes

- [`extracted-ai-heuristics.md`](./extracted-ai-heuristics.md): AI sub-phase priorities, candidate ranking, and deterministic tie-breaking intent
- [`extracted-buff-draft-and-run-loop.md`](./extracted-buff-draft-and-run-loop.md): pre-match buff draft, init effects, and run-loop clean-room normalization
- [`extracted-buff-catalog-step07.md`](./extracted-buff-catalog-step07.md): the Step 07 starter Buff subset and why it fits the frozen atom set
