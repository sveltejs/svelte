## Svelte 5 rewrite

Please note that [the Svelte codebase is currently being rewritten for Svelte 5](https://svelte.dev/blog/runes). Changes should target Svelte 5, which lives on the default branch (`main`).

If your PR concerns Svelte 4 (including updates to [svelte.dev.docs](https://svelte.dev/docs)), please ensure the base branch is `svelte-4` and not `main`.

### Before submitting the PR, please make sure you do the following

- [ ] It's really useful if your PR references an issue where it is discussed ahead of time. In many cases, features are absent for a reason. For large changes, please create an RFC: https://github.com/sveltejs/rfcs
- [ ] Prefix your PR title with `feat:`, `fix:`, `chore:`, or `docs:`.
- [ ] This message body should clearly illustrate what problems it solves.
- [ ] Ideally, include a test that fails without this PR but passes with it.

### Tests and linting

- [ ] Run the tests with `pnpm test` and lint the project with `pnpm lint`
