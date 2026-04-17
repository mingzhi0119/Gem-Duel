# ADR-0002: Mechanical Agent Guardrails

## ZH

### 决策

- Agent 协作治理采用“三位一体”模式：文档规则 + 机械化强制 + 可执行契约。
- `AGENTS.md` 改为分层布局：根目录提供短规则，各子目录只补本地特有约束。
- 计划采用 `dependency-cruiser` 与 `eslint-plugin-boundaries` 作为依赖边界双重防线。
- 计划采用 `zod`、OpenAPI、AsyncAPI、`contract snapshots` 作为契约硬化路径。
- 计划采用 `pure-rand`、`golden replays`、`fast-check` 作为确定性回归路径。

### 原因

- 纯自然语言规则对 Agent 只有提示作用，无法稳定阻止越界行为。
- Gem Duel 的核心风险不是“写不出代码”，而是“在错误边界里写出了看似可运行的代码”。
- 分层 AGENTS 能减少无关规则噪音，让最近目录的约束更明确。

## EN

### Decision

- Agent governance uses a three-part model: written docs, mechanical enforcement, and executable contracts.
- `AGENTS.md` becomes layered: the repo root carries the short global rules, while subdirectories add only local constraints.
- The planned dependency-boundary stack is `dependency-cruiser` plus `eslint-plugin-boundaries`.
- The planned contract-hardening stack is `zod`, OpenAPI, AsyncAPI, and contract snapshots.
- The planned determinism-regression stack is `pure-rand`, golden replays, and `fast-check`.

### Rationale

- Pure natural-language rules can guide an agent, but they cannot reliably block boundary violations.
- The biggest risk in Gem Duel is not failing to produce code; it is producing plausible code inside the wrong boundary.
- Layered AGENTS reduce irrelevant noise and make nearest-directory constraints easier to follow.
