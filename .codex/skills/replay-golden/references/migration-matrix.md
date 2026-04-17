# Migration Matrix

Use this matrix when replay compatibility is in question.

## Expected Policy

- patch-level schema additions: prefer migration and hash preservation when semantics do not change
- ruleset changes with identical semantics: document and verify
- engine rewrites with semantic changes: require explicit replay update and explanation
- incompatible replay shape: document event-playback-only or no-migration support

## Escalate To ADR

- command replay compatibility changes
- authoritative field removal
- hash algorithm changes
- spectator or information-filtering changes that alter visible payloads
