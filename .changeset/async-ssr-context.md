---
'svelte': patch
---

Fix async SSR context race by relying on per-render AsyncLocalStorage and only falling back to a local store when ALS is unavailable.
