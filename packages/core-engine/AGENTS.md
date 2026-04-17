# Core Engine Rules

- This directory owns deterministic `Command -> Event -> State` progression and actor-based effect resolution. 此目录负责确定性的 `Command -> Event -> State` 推进与 actor-based effect resolution。
- Use `XState v5 actor model` as the primary chain-resolution model for card abilities, royal effects, and extra turns. `XState v5 actor model` 是卡牌能力、Royal 效果与 extra turn 的唯一主建模方案。
- Accept randomness only through explicit namespaced RNG streams such as `fork(namespace)`; never use hidden random helpers. 随机性只能通过显式分域 RNG（如 `fork(namespace)`）进入，禁止隐藏随机辅助函数。
- Never use runtime clocks, browser APIs, Electron APIs, filesystem APIs, network APIs, or room-service transport code here. 禁止在此目录中使用时钟、浏览器 API、Electron API、文件系统 API、网络 API 或 room-service 传输代码。
- Every new rule path should eventually gain actor/state-machine tests, replay samples, and determinism coverage. 每条新规则路径最终都应补 actor/状态机测试、replay 样例与确定性覆盖。
