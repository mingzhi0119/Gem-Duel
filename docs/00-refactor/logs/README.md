# Refactor Step Logs

## ZH

本目录存放全量重构的分步日志。日志必须与步骤总表同步维护，不允许只更新代码而不更新日志。

### 规则

- 文件命名固定为 `step-XX-<slug>.md`。
- 一个步骤至少对应一份日志；若多次推进同一步，可在同一文件中按时间追加。
- 步骤状态从 `未开始` 变为 `进行中` 或 `已完成` 时，必须在同一提交内同步更新：
    - `docs/00-refactor/rebuild-execution-tracker.md`
    - 对应 `logs/step-XX-<slug>.md`
    - 与该步骤对应的提交说明

### 日志模板

- 日期
- 作者
- Step ID
- 本步目标
- 实际改动内容
- 涉及路径
- 关键决策
- 风险/阻塞
- 下一步
- 对应 Commit

## EN

This directory stores per-step logs for the full rebuild. Logs must be maintained together with the execution tracker; code-only progress is not allowed.

### Rules

- File names must follow `step-XX-<slug>.md`.
- Each step must have at least one log file; if the same step advances multiple times, append chronological entries in the same file.
- Whenever a step moves from `未开始` to `进行中` or `已完成`, the same commit must update:
    - `docs/00-refactor/rebuild-execution-tracker.md`
    - the matching `logs/step-XX-<slug>.md`
    - the commit message boundary for that step

### Log Template

- Date
- Author
- Step ID
- Goal
- Actual changes
- Touched paths
- Key decisions
- Risks / blockers
- Next step
- Commit reference
