# UI Rules

- Keep this package presentational and interaction-focused.
- Do not add scoring, Buff resolution, victory logic, or transport authority here.
- Consume view-models and contracts; do not reach into legacy code or host-specific rule code.
- Keep browser- or Next-specific shell bridges such as session rails or document-presentation sync in the host app layer; if a new shell is introduced, re-extract those seams deliberately instead of pulling browser globals into `packages/ui`.
