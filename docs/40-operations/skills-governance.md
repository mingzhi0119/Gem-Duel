# Skills Governance

## ZH

本文件定义 Gem Duel 项目本地 Codex Skills 的质量标准、目录约束与步骤映射。Skills 是治理资产，不是产品代码。

## 质量标准

- 每个 Skill 的 `SKILL.md` 必须 `<= 200` 行。
- frontmatter `description` 必须明确包含 `Use when ...`。
- 每个 Skill 至少包含：
    - 一个 `references/` 文件
    - 一个 `templates/` 或 `examples/` 文件
    - 一个 `scripts/` 文件
- 每个 Skill 都必须在 `docs/00-refactor/rebuild-execution-tracker.md` 中被引用。
- `SKILL.md` 只保留触发条件、工作流、守卫与输出；深层细节下沉到 `references/`。

## 当前项目本地 Skills

- `contract-change`
    - 触发：修改 `packages/contracts/*`、错误码、WebSocket 消息、Replay schema、Snapshot 契约
    - 主要步骤：Step 02、Step 05、Step 07
- `add-buff`
    - 触发：新增或修改 Roguelike Buff、Buff registry、Buff replay 语义
    - 主要步骤：Step 02.5、Step 07
- `add-phase-transition`
    - 触发：新增或修改 phase、command、phase guard、effect actor handoff
    - 主要步骤：Step 03、Step 04
- `legacy-mine`
    - 触发：需要从 `docs/99-legacy/` 与 git 历史提取规则本质；若旧归档仍存在，也只作为只读补充
    - 主要步骤：Step 04、Step 07、Step 08
- `replay-golden`
    - 触发：新增、验证或迁移 golden replay；处理 `finalStateHash` 变更
    - 主要步骤：Step 03、Step 04、Step 05、Step 07

## 目录规则

- Skills 放在 `.codex/skills/`，与项目一起版本化。
- Skill 的 script 可以是占位 CLI，但必须表达可机械化的检查或操作。
- Skill 的 template/example 只用于指导一致性，不得复制产品源码。
- 需要更高层背景时，优先链接到 `docs/`，不要把长篇架构解释塞进 `SKILL.md`。

## 维护流程

1. 新增或修改 Skill 时，先更新 `.codex/skills/AGENTS.md` 适用规则。
2. 再更新 Skill 本体、references、templates/examples、scripts。
3. 再更新 `rebuild-execution-tracker.md` 的步骤映射。
4. 最后更新 Step 01 或对应步骤日志，记录 Skills 治理变化。

## EN

This document defines the quality bar, directory rules, and step mapping for Gem Duel's project-local Codex skills. Skills are governance assets, not product code.

## Quality Bar

- Every skill `SKILL.md` must stay at `<= 200` lines.
- The frontmatter `description` must explicitly contain `Use when ...`.
- Every skill must include at least:
    - one `references/` file
    - one `templates/` or `examples/` file
    - one `scripts/` file
- Every skill must be referenced from `docs/00-refactor/rebuild-execution-tracker.md`.
- `SKILL.md` stays focused on trigger conditions, workflow, guardrails, and outputs; deeper detail belongs in `references/`.

## Current Project-Local Skills

- `contract-change`
    - Trigger: changing `packages/contracts/*`, error codes, WebSocket messages, replay schemas, or snapshot contracts
    - Primary steps: Step 02, Step 05, Step 07
- `add-buff`
    - Trigger: adding or changing Roguelike Buffs, Buff registries, or Buff replay semantics
    - Primary steps: Step 02.5, Step 07
- `add-phase-transition`
    - Trigger: changing phases, commands, phase guards, or effect-actor handoff
    - Primary steps: Step 03, Step 04
- `legacy-mine`
    - Trigger: extracting rule intent from `docs/99-legacy/` and git history; if the old archive still exists, it is only a read-only supplement
    - Primary steps: Step 04, Step 07, Step 08
- `replay-golden`
    - Trigger: adding, verifying, or migrating golden replays; handling `finalStateHash` changes
    - Primary steps: Step 03, Step 04, Step 05, Step 07

## Directory Rules

- Skills live under `.codex/skills/` and are versioned with the project.
- Skill scripts may be placeholder CLIs, but they must still express a mechanical check or operation.
- Skill templates/examples guide consistency only and may not duplicate product source files.
- When deeper context is needed, link to `docs/` instead of overloading `SKILL.md` with long architecture prose.

## Maintenance Flow

1. Update `.codex/skills/AGENTS.md` if the local skill rules change.
2. Update the skill body, references, templates/examples, and scripts.
3. Update the step mapping in `rebuild-execution-tracker.md`.
4. Update Step 01 or the matching step log to record the skills-governance change.
