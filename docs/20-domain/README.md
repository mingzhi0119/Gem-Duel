# Domain

## ZH

- `packages/domain` 保存规则版本、phase、player、gem、错误分类和值对象。
- `packages/core-engine` 保存状态机与命令处理，但不得拥有宿主依赖。
- 未来全量玩法迁移应以“规则目录 + phase + replay 示例”为单元推进。
- 确定性输入、golden replay 与性质测试纪律请参考 [`determinism-and-replay-discipline.md`](./determinism-and-replay-discipline.md)。

## EN

- `packages/domain` owns ruleset versions, phases, players, gems, error categories, and value objects.
- `packages/core-engine` owns the state machine and command handling without host dependencies.
- Future parity migration should move rule sets in units of rule directory + phase coverage + replay examples.
- See [`determinism-and-replay-discipline.md`](./determinism-and-replay-discipline.md) for deterministic inputs, golden replays, and property-testing discipline.
