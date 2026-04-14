<!-- crag:auto-start -->
# GEMINI.md

> Generated from governance.md by crag. Regenerate: `crag compile --target gemini`

## Project Context

- **Name:** svelte-monorepo
- **Description:** monorepo for svelte and friends
- **Stack:** node, typescript
- **Runtimes:** node

## Rules

### Quality Gates

Run these checks in order before committing any changes:

1. [lint] `npm run lint`
2. [lint] `npx tsc --noEmit`
3. [test] `npm run test`
4. [build] `npm run build`
5. [ci (inferred from workflow)] `pnpm test`
6. [ci (inferred from workflow)] `pnpm test runtime-runes`
7. [ci (inferred from workflow)] `pnpm check:tsgo`
8. [ci (inferred from workflow)] `pnpm check`
9. [ci (inferred from workflow)] `pnpm lint`
10. [ci (inferred from workflow)] `}`
11. [ci (inferred from workflow)] `pnpm build`
12. [contributor docs (advisory — confirm before enforcing)] `pnpm check:watch  # from CONTRIBUTING.md`

### Security

- No hardcoded secrets — grep for sk_live, AKIA, password= before commit

### Workflow

- Follow project commit conventions
- Run quality gates before committing
- Review security implications of all changes

<!-- crag:auto-end -->
