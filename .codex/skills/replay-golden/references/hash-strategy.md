# Hash Strategy

Stable replay validation depends on a stable state hash.

## Hash Inputs

- deterministic snapshot projection
- normalized ordering
- normalized null handling
- explicit version metadata when required by the project docs

## Do Not Rely On

- object insertion order by accident
- pretty-printed JSON as the source of truth
- platform-local timestamps
- non-deterministic float formatting

## Review Questions

- Did hidden information stay filtered appropriately?
- Did replay migration change only schema shape, or gameplay semantics too?
- Is the final hash difference intentional and documented?
