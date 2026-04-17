# Web App Rules

- Use `apps/web` for Next.js routing, composition, and shell concerns only.
- Keep rule execution out of pages, layouts, and client components.
- Push gameplay logic into `packages/application` and `packages/core-engine`.
- Keep local API routes aligned with the stricter rules in `apps/web/app/api/AGENTS.md`.
