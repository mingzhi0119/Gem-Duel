# Effect Queue to Actor Lifecycle Mapping

Older notes may say "pending effects queue." The frozen Step 02.5 project wording is `activeEffects` plus the effect actor lifecycle.

## Mapping

- old wording: pending effect queue
- public serialized view: `activeEffects`
- project wording: effect actor lifecycle and emitted event stream

## What to Document for a Transition

- Does the command spawn an effect actor?
- Which lifecycle event confirms progress: `effect.spawned`, `effect.started`, or `effect.completed`?
- Does the match phase wait, resume, or branch into another actor?
- Does replay record the command, the emitted event, or both?

## Do Not Do

- Do not introduce a private in-memory queue that bypasses the documented actor lifecycle.
- Do not treat `activeEffects` as serialized actor references; it is only the public snapshot view of unfinished effects.
- Do not let room-service or UI invent phase transitions that the engine does not own.
