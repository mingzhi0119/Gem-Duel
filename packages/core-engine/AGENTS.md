# Core Engine Rules

- This directory is pure match execution only: command handling, event production, phase guards, and state transitions.
- Never use runtime clocks, random globals, browser APIs, Electron APIs, filesystem APIs, or network APIs here.
- Model gameplay as deterministic `Command -> Event -> State` flow and preserve replayability.
- Every new rule path should eventually gain a replay sample and state-machine coverage.
