# Effect Queue to Actor Lifecycle Mapping

Older notes may say "pending effects queue." The formal rebuild direction is `XState v5 actor model`.

## Mapping

- old wording: pending effect queue
- project wording: effect actor lifecycle and emitted event stream

## What to Document for a Transition

- Does the command spawn an effect actor?
- Which event confirms the effect result?
- Does the match phase wait, resume, or branch into another actor?
- Does replay record the command, the emitted event, or both?

## Do Not Do

- Do not introduce a private in-memory queue that bypasses the documented actor lifecycle.
- Do not let room-service or UI invent phase transitions that the engine does not own.
