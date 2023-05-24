# HEADS UP: BIG RESTRUCTURING UNDERWAY

The Svelte repo is currently in the process of heavy restructuring for Svelte 4. After that, work on Svelte 5 will likely change a lot on the compiler aswell. For that reason, please don't open PRs that are large in scope, touch more than a couple of files etc. In other words, bug fixes are fine, but feature PRs will likely not be merged.

### Before submitting the PR, please make sure you do the following
- [ ] It's really useful if your PR references an issue where it is discussed ahead of time. In many cases, features are absent for a reason. For large changes, please create an RFC: https://github.com/sveltejs/rfcs
- [ ] Prefix your PR title with `feat:`, `fix:`, `chore:`, or `docs:`.
- [ ] This message body should clearly illustrate what problems it solves.
- [ ] Ideally, include a test that fails without this PR but passes with it.

### Tests
-  [ ] Run the tests with `npm test` and lint the project with `npm run lint`
