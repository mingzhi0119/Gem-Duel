# Contracts Rules

- Define boundary shapes here first, then let other layers consume them.
- Keep runtime schemas, inferred types, error models, and protocol docs aligned.
- Do not pull domain behavior, UI concerns, or infrastructure logic into this package.
- Future contract tooling must be reflected in `docs/30-contracts/` before implementation.
