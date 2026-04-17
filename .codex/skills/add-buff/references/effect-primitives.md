# Effect Primitives

Approved first-wave effect atoms:

- `grant_privilege`
- `take_opponent_token`
- `gain_royal`
- `take_extra_turn`
- `discard_to_limit`
- `take_board_token`
- `override_bonus_color`

## Usage Rules

- Prefer composing these atoms over inventing ad hoc per-Buff behavior.
- If a Buff needs a new atom, route that work through Step 02.5 with `contract-change`.
- Buff handlers should emit standard effect atoms or standard events, never hidden side effects.

## Escalate Instead of Improvising

Escalate when the Buff would require:

- New hidden information channels
- New replay-only state
- Direct RNG consumption
- Direct room-service or UI concerns
