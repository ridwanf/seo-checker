# AGENTS.md

This file helps coding agents work effectively in this monorepo.

## Scope

- Applies to the whole repository.
- Prefer root-level commands unless task scope is clearly limited to one package.

## First Read

- Project overview and setup: [README.md](README.md)
- Turbo task graph: [turbo.json](turbo.json)
- Dev/prod containers: [docker-compose.dev.yml](docker-compose.dev.yml), [docker-compose.yml](docker-compose.yml)

## Repository Map

- API service (NestJS): [apps/api](apps/api)
- Web app (React + Vite): [apps/web](apps/web)
- Shared TS types: [packages/shared-types](packages/shared-types)
- SEO analysis engine: [packages/seo-engine](packages/seo-engine)

## Toolchain Requirements

- Node: >= 22.0.0
- pnpm: >= 10.0.0
- Use workspace package manager and lockfile; do not mix npm/yarn commands.

## Common Commands

From repository root:

- Install: `pnpm install`
- Dev (all workspaces): `pnpm dev`
- Build (all workspaces): `pnpm build`
- Lint (all workspaces): `pnpm lint`
- Test (all workspaces): `pnpm test`

Package-scoped examples:

- API dev: `pnpm --filter @seo-checker/api dev`
- Web dev: `pnpm --filter @seo-checker/web dev`
- Engine tests: `pnpm --filter @seo-checker/seo-engine test`

## Build And Dependency Notes

- This is a pnpm workspace with Turbo; workspace packages depend on each other via `workspace:*`.
- `build` uses Turbo dependency ordering (`^build`), so shared packages should build before dependents.
- If a scoped API build fails due to stale artifacts, clean old build state then rebuild shared packages first.

## Testing And Validation

- API and engine use Vitest.
- Web uses Vitest and Playwright e2e.
- Prefer targeted checks first (single package) and then run root-level checks before finishing larger changes.

## Service And Runtime Notes

- API uses Redis for rate limiting/caching; local dev flows may require Redis running.
- API health endpoint is provided by Health module and is used in container health checks.

## File-Level Conventions

- Keep changes minimal and scoped to the task.
- Preserve existing TypeScript, NestJS, and React patterns used in nearby files.
- Avoid broad refactors unless explicitly requested.

## Docs To Link Instead Of Duplicating

- Root setup and high-level commands: [README.md](README.md)
- API framework details: [apps/api/README.md](apps/api/README.md)
- Web framework details: [apps/web/README.md](apps/web/README.md)

## Add Unit tests
- Whenever you create a function or UI alse create the unit test, run and make sure the tests are pass