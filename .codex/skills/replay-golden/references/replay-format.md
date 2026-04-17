# Replay Format

Authoritative replay wire format:

- `MessagePack` via the documented `msgpackr` direction

JSON exists only for:

- debug export
- human-readable inspection
- migration review notes

## Required Bundle Fields

- `schemaVersion`
- `rulesetVersion`
- `engineVersion`
- `seed`
- `initialSnapshot`
- `commands[]`
- `events[]`
- `finalStateHash`
- `resultSummary`

## Authority Rules

- `events[]` are authoritative.
- `commands[]` are retained for debugging, training, and review.
- Replay changes that alter fields or order must be documented before fixtures move.
