---
trigger: always_on
description: Governance rules for svelte-monorepo — compiled from governance.md by crag
---

# Windsurf Rules — svelte-monorepo

Generated from governance.md by crag. Regenerate: `crag compile --target windsurf`

## Project

monorepo for svelte and friends

**Stack:** node, typescript

## Runtimes

node

## Cascade Behavior

When Windsurf's Cascade agent operates on this project:

- **Always read governance.md first.** It is the single source of truth for quality gates and policies.
- **Run all mandatory gates before proposing changes.** Stop on first failure.
- **Respect classifications.** OPTIONAL gates warn but don't block. ADVISORY gates are informational.
- **Respect path scopes.** Gates with a `path:` annotation must run from that directory.
- **No destructive commands.** Never run rm -rf, dd, DROP TABLE, force-push to main, curl|bash, docker system prune.
- - No hardcoded secrets — grep for sk_live, AKIA, password= before commit
- Follow the project commit conventions.

## Quality Gates (run in order)

1. `npm run lint`
2. `npx tsc --noEmit`
3. `npm run test`
4. `npm run build`
5. `pnpm test`
6. `pnpm test runtime-runes`
7. `pnpm check:tsgo`
8. `pnpm check`
9. `pnpm lint`
10. `}`
11. `pnpm build`
12. `pnpm check:watch  # from CONTRIBUTING.md`

## Rules of Engagement

1. **Minimal changes.** Don't rewrite files that weren't asked to change.
2. **No new dependencies** without explicit approval.
3. **Prefer editing** existing files over creating new ones.
4. **Always explain** non-obvious changes in commit messages.
5. **Ask before** destructive operations (delete, rename, migrate schema).

---

**Tool:** crag — https://www.npmjs.com/package/@whitehatd/crag
