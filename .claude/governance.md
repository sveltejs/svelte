# Governance — svelte-monorepo
# Inferred by crag analyze — review and adjust as needed

## Identity
- Project: svelte-monorepo
- Description: monorepo for svelte and friends
- Stack: node, typescript
- Workspace: pnpm

## Gates (run in order, stop on failure)
### Lint
- npm run lint
- npx tsc --noEmit

### Test
- npm run test

### Build
- npm run build

### CI (inferred from workflow)
- pnpm test
- pnpm test runtime-runes
- pnpm check:tsgo
- pnpm check
- pnpm lint
- }
- pnpm build

### Contributor docs (ADVISORY — confirm before enforcing)
- pnpm check:watch  # from CONTRIBUTING.md

## Advisories (informational, not enforced)
- actionlint  # [ADVISORY]

## Branch Strategy
- Trunk-based development
- Free-form commits
- Commit trailer: Co-Authored-By: Claude <noreply@anthropic.com>

## Security
- No hardcoded secrets — grep for sk_live, AKIA, password= before commit

## Autonomy
- Auto-commit after gates pass

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

## Dependencies
- Package manager: pnpm (pnpm-lock.yaml)

## Import Conventions
- Module system: ESM

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

