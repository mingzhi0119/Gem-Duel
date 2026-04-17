# Hook Points

Use these hook points before proposing a new one. If none fit, escalate through Step 02.5 instead of inventing a private hook.

## Current Hook Families

- `BEFORE_USE_PRIVILEGE`
- `AFTER_USE_PRIVILEGE`
- `BEFORE_REPLENISH_BOARD`
- `AFTER_REPLENISH_BOARD`
- `BEFORE_TAKE_TOKENS`
- `AFTER_TAKE_TOKENS`
- `BEFORE_RESERVE_CARD`
- `AFTER_RESERVE_CARD`
- `BEFORE_BUY_CARD`
- `AFTER_BUY_CARD`
- `BEFORE_GAIN_ROYAL`
- `AFTER_GAIN_ROYAL`
- `BEFORE_EXTRA_TURN`
- `AFTER_EXTRA_TURN`
- `BEFORE_DISCARD_TO_LIMIT`
- `AFTER_DISCARD_TO_LIMIT`
- `BEFORE_VICTORY_CHECK`
- `AFTER_VICTORY_CHECK`
- `BEFORE_MATCH_SETUP`
- `AFTER_MATCH_SETUP`
- `BEFORE_BUFF_ACQUISITION`
- `AFTER_BUFF_ACQUISITION`
- `BEFORE_RUN_REWARD_SELECTION`
- `AFTER_RUN_REWARD_SELECTION`

## Ownership Rules

- Classic rule chain points belong to Step 03/04 and must remain reusable by Buffs.
- Buffs may hook into existing points but may not add hidden intermediate phases or invent a private top-level `BUFF_RESOLUTION` family.
- Use `AFTER_*` when the Buff reacts to a committed domain fact.
- Use `BEFORE_*` when the Buff transforms intent or cost before resolution.
