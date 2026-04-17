# Contract Migration Note

- Change summary: Step 04 replaces the remaining skeleton command payloads with classic-rule payloads and expands `MatchState` to carry the classic board, pyramid, reserve, royal, privilege, turn, and victory surfaces.
- Affected schemas or message types: `GameCommand`, `GameEvent`, `MatchContext`, `MatchState`, snapshot projections, replay fixtures, and the generated OpenAPI / AsyncAPI documents.
- Old shape: the public surface still used placeholder commands such as `TAKE_GEM`, `RESERVE_CARD { slot }`, `BUY_CARD { scoreGain }`, `SELECT_ROYAL { crownsGain }`, plus the manual control commands `BEGIN_ROYAL_RESOLUTION` and `FINISH_MATCH`.
- New shape: command payloads are source-aware and classic-specific, `SELECT_ROYAL` now selects by `royalId`, manual skeleton controls are removed, and snapshots now expose board cells, pyramid rows, royal supply, privilege supply, reserve slots, turn metadata, and `victoryReason`.
- Required consumer updates: build actions from board positions, reserve sources, buy sources, and effect prompts; stop branching on removed placeholder commands; treat `match.finished.reason` and `context.victoryReason` as the public victory source; and project UI-facing state through `PlayerSnapshot` / `SpectatorSnapshot`.
- Replay/version impact: `SCHEMA_VERSION` bumps for the expanded classic surface, `ENGINE_VERSION` bumps for the classic-rule migration, replay fixtures must be regenerated, and Step 04 golden replays become the baseline regression set.
- Tracker / log link: [`../00-refactor/logs/step-04-classic-rules-migration.md`](../00-refactor/logs/step-04-classic-rules-migration.md)
