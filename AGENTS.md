<!-- crag:auto-start -->
# AGENTS.md

> Generated from governance.md by crag. Regenerate: `crag compile --target agents-md`

## Project: svelte-monorepo

monorepo for svelte and friends

## Quality Gates

All changes must pass these checks before commit:

### Lint
1. `npm run lint`
2. `npx tsc --noEmit`

### Test
1. `npm run test`

### Build
1. `npm run build`

### Ci (inferred from workflow)
1. `pnpm test`
2. `pnpm test runtime-runes`
3. `pnpm check:tsgo`
4. `pnpm check`
5. `pnpm lint`
6. `}`
7. `pnpm build`

### Contributor docs (advisory — confirm before enforcing)
1. `pnpm check:watch  # from CONTRIBUTING.md`

## Coding Standards

- Stack: node, typescript
- Follow project commit conventions

## Architecture

- Type: monolith

## Key Directories

- `.github/` — CI/CD
- `assets/` — static assets
- `packages/` — workspace packages

## Testing

- Framework: vitest
- Layout: flat

## Code Style

- Indent: ? tabs
- Formatter: prettier
- Linter: eslint

## Anti-Patterns

Do not:
- Do not leave `console.log` in production code — use a proper logger
- Do not use synchronous filesystem APIs in request handlers
- Do not use `any` type — use `unknown` or proper types instead
- Do not use `@ts-ignore` — fix the type error or use `@ts-expect-error` with a reason
- Prefer `as const` over `enum` for string unions

## Framework Conventions

- Svelte
- Use runes ($state, $derived) for reactivity

## Security

- No hardcoded secrets — grep for sk_live, AKIA, password= before commit

## Workflow

1. Read `governance.md` at the start of every session — it is the single source of truth.
2. Run all mandatory quality gates before committing.
3. If a gate fails, fix the issue and re-run only the failed gate.
4. Use the project commit conventions for all changes.

<!-- crag:auto-end -->
